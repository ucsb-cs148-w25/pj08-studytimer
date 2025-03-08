import React, { useState, useEffect } from 'react';
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const CommunityFeed = () => {
  const [posts, setPosts] = useState([]);
  const [newPostText, setNewPostText] = useState('');

  const db = getFirestore();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = [];
      snapshot.forEach((doc) => {
        fetchedPosts.push({ id: doc.id, ...doc.data() });
      });
      setPosts(fetchedPosts);
    });
    return () => unsubscribe();
  }, [db]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert('You must be logged in to create a post!');
      return;
    }
    if (!newPostText.trim()) return;

    try {
      await addDoc(collection(db, 'posts'), {
        text: newPostText.trim(),
        userId: currentUser.uid,
        displayName: currentUser.displayName || 'Anonymous',
        photoURL: currentUser.photoURL || 'https://via.placeholder.com/40',
        createdAt: serverTimestamp()
      });
      setNewPostText('');
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <div className="community-feed">
      <h2>Community Feed</h2>
      <form onSubmit={handleCreatePost} className="create-post-form">
        <textarea
          value={newPostText}
          onChange={(e) => setNewPostText(e.target.value)}
          placeholder="What's on your mind?"
          className="new-post-input"
        />
        <button type="submit" className="post-button">
          Post
        </button>
      </form>

      <div className="posts-list">
        {posts.map((post) => (
          <div key={post.id} className="post-item">
            <img src={post.photoURL} alt={post.displayName} className="post-author-icon" />
            <div className="post-content">
              <div className="post-author-name">{post.displayName}</div>
              <div className="post-text">{post.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunityFeed;

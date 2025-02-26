import React, { useEffect, useState } from "react";
import "./TaskNav.css";

import { db } from "../../firebase";
import { doc, setDoc, getDocs, updateDoc, deleteDoc, collection, writeBatch } from "firebase/firestore";

const TaskNav = ({ uid, setSelectedTaskView }) => {
  // const [boards, setBoards] = useState([]);
  const [lists, setLists] = useState([]);
  const [deletedItems, setDeletedItems] = useState([]); 
  const [deletedExpanded, setDeletedExpanded] = useState(true);

  // const createNewBoard = () => {
  //   const newBoard = {
  //     id: Date.now().toString(),
  //     title: "Untitled Board",
  //     isEditing: false,
  //   };
  //   setBoards((prev) => [...prev, newBoard]);
  // };

  const updateListDoc = async (listId, data) => {
    console.log("Updating list", listId, data)
    try {
      const listDocRef = doc(db, `users/${uid}/lists`, listId.toString());
      await updateDoc(listDocRef, data);
    } catch (error ) {
      console.error("Error updating list document: ", error);
    }
  };

  useEffect(() => {
    if (!uid) {
      console.error("User not signed in, cannot load lists");
      return;
    }
    const loadLists = async () => {
      try {
        const listSnapshot = await getDocs(collection(db, `users/${uid}/lists`));
        const listData = listSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setLists(listData);
      }
      catch (error) {
        console.error("Error loading lists: ", error);
      }
    };
    loadLists();
  }, [uid]);

  const createNewList = async() => {
    if (!uid) { 
      console.error("User ID not found while creating new list");
      return;
    }
    const customID = Date.now().toString();
    const newList = {
      title: "",
      isEditing: true,
    };
    try {
      const listDocRef = doc(db, `users/${uid}/lists`, customID);
      await setDoc(listDocRef, newList);
      setLists((prev) => [...prev, { id: customID, ...newList }]);
    }
    catch (error) {
      console.error("Error creating new list: ", error);
    }
  };

  const handleDoubleClick = (id, type) => {
    // if (type === "board") {
    //   setBoards((prev) =>
    //     prev.map((board) =>
    //       board.id === id ? { ...board, isEditing: true } : board
    //     )
    //   );
    // } else {
      setLists((prev) =>
        prev.map((list) =>
          list.id === id ? { ...list, isEditing: true } : list
        )
      );
    // }
  };

  const handleTitleChange = (e, id, type) => {
    const newTitle = e.target.value;
    // if (type === "board") {
    //   setBoards((prev) =>
    //     prev.map((board) =>
    //       board.id === id ? { ...board, title: newTitle } : board
    //     )
    //   );
    // } else {
      setLists((prev) =>
        prev.map((list) =>
          list.id === id ? { ...list, title: newTitle } : list
        )
      );
    // }
  };

  const handleBlur = (id, type) => {
    // if (type === "board") {
    //   setBoards((prev) =>
    //     prev.map((board) =>
    //       board.id === id ? { ...board, isEditing: false } : board
    //     )
    //   );
    // } else {
      setLists((prev) => {
        const updatedLists = prev.map((list) =>
          list.id === id ? { ...list, isEditing: false } : list
        );

        const updatedList = updatedLists.find((list) => list.id === id);
        if (updatedList) {
          updateListDoc(id.toString(), { title: updatedList.title, isEditing: false });
        }
        console.log("Updated lists: ", updatedLists, updatedList.title);
        return updatedLists;
      });
    // }
  };

  const handleSelect = (id, type, title) => {
    setSelectedTaskView({ id, type, title });
  };

  const handleKeyDown = (e, id, type) => {
    if (e.key === "Enter") {
      handleBlur(id, type);
    }
  };

  const handleDelete = async (id) => { // there was a delete here!
    // if (type === "board") {
    //   const boardToDelete = boards.find((board) => board.id === id);
    //   if (boardToDelete) {
    //     setBoards(boards.filter((board) => board.id !== id));
    //     setDeletedItems((prev) =>
    //       prev.some((item) => item.id === id && item.type === "board")
    //        ? prev
    //         : [...prev, { ...boardToDelete, type: "board" }]
    //     );
    //   }
    // }
    if (!uid) {
      console.error("User not signed in, cannot delete list");
      return;
    }
    try {
      await deleteDoc(doc(db, `users/${uid}/lists`, id.toString()));
      const batch = writeBatch(db);

      const taskQuery = await getDocs(collection(db, `users/${uid}/lists{${id.toString()}}/tasks`));
      const taskSnapshot = taskQuery.docs;
      taskSnapshot.forEach((taskSnap) => {
        batch.delete(doc(db, `users/${uid}/lists{${id.toString()}}/tasks`, taskSnap.id.toString()));
      })

      const labelQuery = await getDocs(collection(db, `users/${uid}/lists{${id.toString()}}/labels`));
      const labelSnapshot = labelQuery.docs;
      labelSnapshot.forEach((labelSnap) => {
        batch.delete(doc(db, `users/${uid}/lists{${id.toString()}}/labels`, labelSnap.id.toString()));
      });

      await batch.commit();
      setLists((prev) => prev.filter((list) => list.id.toString() !== id.toString()));
    }
    catch (error) {
      console.error("Error deleting list: ", error);
    }

    const listToDelete = lists.find((list) => list.id === id);
    if (listToDelete) {
      setLists(lists.filter((list) => list.id !== id));
      setDeletedItems((prev) =>
        prev.some((item) => item.id === id && item.type === "list")
          ? prev
          : [...prev, { ...listToDelete, type: "list" }]
      );
    }
  };

  const toggleDeletedExpanded = () => {
    setDeletedExpanded((prev) => !prev);
  };

  return (
    <div className="task-nav">
      <div className="nav-header">
        <h2>New Container?</h2> {/*will be changed later*/}
        <div className="nav-header-icons">
          {/* <button onClick={createNewBoard} title="Create a New Board">
            <img src="/taskBoard.svg" alt="taskBoard" className="taskBoard-icon" />
          </button> */}
          <button onClick={createNewList} title="Create a New List">
            <img src="/taskList.svg" alt="taskList" className="taskList-icon" />
          </button>
        </div>
      </div>

      {/* <div className="nav-section">
        <h3>YOUR BOARDS</h3>
        <ul>
          {boards.map((board) => (
            <li
              key={board.id}
              onClick={() => handleSelect(board.id, "board", board.title)}
              onDoubleClick={() => handleDoubleClick(board.id, "board")}
              className="nav-item"
            >
              {board.isEditing ? (
                <input
                  type="text"
                  value={board.title}
                  autoFocus
                  onChange={(e) => handleTitleChange(e, board.id, "board")}
                  onBlur={() => handleBlur(board.id, "board")}
                  onKeyDown={(e) => handleKeyDown(e, board.id, "board")}
                />
              ) : (
                <span>{board.title}</span>
              )}
              <button
                className="trash-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(board.id, "board");
                }}
              >
                <img src="/trash.svg" alt="Delete Board" />
              </button>
            </li>
          ))}
        </ul>
      </div> */}

      <div className="nav-section">
        <h3>YOUR LISTS</h3>
        <ul>
          {lists.map((list) => (
            <li
              key={list.id}
              onClick={() => handleSelect(list.id, "list", list.title)}
              onDoubleClick={() => handleDoubleClick(list.id, "list")}
              className="nav-item"
            >
              {list.isEditing ? (
                <input
                  type="text"
                  value={list.title}
                  autoFocus
                  onChange={(e) => handleTitleChange(e, list.id, "list")}
                  onBlur={() => handleBlur(list.id, "list")}
                  onKeyDown={(e) => handleKeyDown(e, list.id, "list")}
                />
              ) : (
                <span>{list.title || "Untitled List"}</span>
              )}
              <button
                className="trash-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(list.id);
                }}
              >
                <img src="/trash.svg" alt="Delete List" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="nav-section">
        <div className="nav-section-header" onClick={toggleDeletedExpanded}>
          <h3>RECENTLY DELETED</h3>
          <img
            src="/dropdown.svg"
            alt="Expand/Collapse"
            className={`dropdown-icon ${deletedExpanded ? "open" : ""}`}
          />
        </div>
        {deletedExpanded && (
          <ul>
            {deletedItems.map((item) => (
              <li key={item.id} className="deleted-item">
                {item.type === "board" ? (
                  <img
                    src="/taskBoard.svg"
                    alt="Board Icon"
                    className="deleted-item-icon"
                  />
                ) : (
                  <img
                    src="/taskList.svg"
                    alt="List Icon"
                    className="deleted-item-icon"
                  />
                )}
                <span>{item.title}</span>
              </li>
            ))}
            {deletedItems.length === 0 && (
              <li className="no-deleted-items">No deleted items</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TaskNav;

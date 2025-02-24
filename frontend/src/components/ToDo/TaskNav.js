import React, { useState } from "react";
import "./TaskNav.css";

const TaskNav = ({ setSelectedTaskView }) => {
  const [boards, setBoards] = useState([]);
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

  const createNewList = () => {
    const newList = {
      id: Date.now().toString(),
      title: "Untitled List",
      isEditing: false,
    };
    setLists((prev) => [...prev, newList]);
  };

  const handleDoubleClick = (id, type) => {
    if (type === "board") {
      setBoards((prev) =>
        prev.map((board) =>
          board.id === id ? { ...board, isEditing: true } : board
        )
      );
    } else {
      setLists((prev) =>
        prev.map((list) =>
          list.id === id ? { ...list, isEditing: true } : list
        )
      );
    }
  };

  const handleTitleChange = (e, id, type) => {
    const newTitle = e.target.value;
    if (type === "board") {
      setBoards((prev) =>
        prev.map((board) =>
          board.id === id ? { ...board, title: newTitle } : board
        )
      );
    } else {
      setLists((prev) =>
        prev.map((list) =>
          list.id === id ? { ...list, title: newTitle } : list
        )
      );
    }
  };

  const handleBlur = (id, type) => {
    if (type === "board") {
      setBoards((prev) =>
        prev.map((board) =>
          board.id === id ? { ...board, isEditing: false } : board
        )
      );
    } else {
      setLists((prev) =>
        prev.map((list) =>
          list.id === id ? { ...list, isEditing: false } : list
        )
      );
    }
  };

  const handleSelect = (id, type, title) => {
    setSelectedTaskView({ id, type, title });
  };

  const handleKeyDown = (e, id, type) => {
    if (e.key === "Enter") {
      handleBlur(id, type);
    }
  };

  const handleDelete = (id, type) => {
    if (type === "board") {
      const boardToDelete = boards.find((board) => board.id === id);
      if (boardToDelete) {
        setBoards(boards.filter((board) => board.id !== id));
        setDeletedItems((prev) =>
          prev.some((item) => item.id === id && item.type === "board")
            ? prev
            : [...prev, { ...boardToDelete, type: "board" }]
        );
      }
    } else {
      const listToDelete = lists.find((list) => list.id === id);
      if (listToDelete) {
        setLists(lists.filter((list) => list.id !== id));
        setDeletedItems((prev) =>
          prev.some((item) => item.id === id && item.type === "list")
            ? prev
            : [...prev, { ...listToDelete, type: "list" }]
        );
      }
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
                <span>{list.title}</span>
              )}
              <button
                className="trash-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(list.id, "list");
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

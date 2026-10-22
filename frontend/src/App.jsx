import { useEffect, useState } from "react";
import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000" });

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [cacheStatus, setCacheStatus] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const res = await api.get("/tasks");
      setTasks(res.data);
      setCacheStatus(res.headers["x-cache"] || "");
      setError("");
    } catch {
      setError("Cannot reach the backend. Is it running on port 5000?");
    }
  };

  useEffect(() => { load(); }, []);

  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await api.post("/tasks", { title });
    setTitle("");
    load();
  };

  const toggle = async (t) => { await api.put(`/tasks/${t._id}`, { completed: !t.completed }); load(); };
  const remove = async (id) => { await api.delete(`/tasks/${id}`); load(); };
  const saveEdit = async (id) => {
    if (editTitle.trim()) await api.put(`/tasks/${id}`, { title: editTitle });
    setEditId(null);
    load();
  };

  return (
    <div className="container">
      <h1>
        Task Manager
        {cacheStatus && <span className={`badge ${cacheStatus}`}>cache: {cacheStatus}</span>}
      </h1>

      <form onSubmit={addTask}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New task..." />
        <button type="submit">Add</button>
      </form>

      {error && <p className="error">{error}</p>}

      <ul>
        {tasks.slice(0, 100).map((t) => (
          <li key={t._id}>
            <input type="checkbox" style={{ flex: "none" }} checked={t.completed} onChange={() => toggle(t)} />
            {editId === t._id ? (
              <>
                <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                <button onClick={() => saveEdit(t._id)}>Save</button>
                <button className="ghost" onClick={() => setEditId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <span className={`title ${t.completed ? "done" : ""}`}>{t.title}</span>
                <button className="ghost" onClick={() => { setEditId(t._id); setEditTitle(t.title); }}>Edit</button>
                <button className="danger" onClick={() => remove(t._id)}>Delete</button>
              </>
            )}
          </li>
        ))}
        {tasks.length === 0 && !error && <p>No tasks yet.</p>}
        {tasks.length > 100 && <p className="desc">Showing first 100 of {tasks.length} tasks.</p>}
      </ul>
    </div>
  );
}

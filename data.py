import sqlite3
from pydantic import BaseModel
from pathlib import Path

DB_PATH = Path('lr3.db')  


class Message(BaseModel):
    title: str
    topic: str
    date: str
    category: str
    message: str
    newStyle: bool
    html: bool

DEFAULT_CATEGORIES = ["Матч", "Трансфер", "Игрок", "Команда", "Прогноз"]

def _connect():
    return sqlite3.connect(str(DB_PATH))

def _ensure_schema():
    con = _connect()
    cur = con.cursor()
    # Таблица сообщений
    cur.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            topic TEXT,
            date TEXT,
            category TEXT,
            message TEXT,
            newStyle INTEGER,
            html INTEGER
        )
    ''')
    # Таблица категорий
    cur.execute('''
        CREATE TABLE IF NOT EXISTS categories (
            name TEXT PRIMARY KEY
        )
    ''')
    con.commit()
    con.close()

def init_categories():
    _ensure_schema()
    con = _connect()
    cur = con.cursor()
    cur.execute('SELECT COUNT(*) FROM categories')
    if cur.fetchone()[0] == 0:
        for cat in DEFAULT_CATEGORIES:
            cur.execute('INSERT INTO categories(name) VALUES(?)', (cat,))
        con.commit()
    con.close()

def insert_message(msg: Message):
    _ensure_schema()
    con = _connect()
    cur = con.cursor()
    cur.execute('''
        INSERT INTO messages (title, topic, date, category, message, newStyle, html)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        msg.title, msg.topic, msg.date, msg.category,
        msg.message, int(msg.newStyle), int(msg.html)
    ))
    con.commit()
    con.close()

def get_messages():
    _ensure_schema()
    con = _connect()
    cur = con.cursor()
    cur.execute('SELECT title, topic, date, category, message, newStyle, html FROM messages')
    rows = cur.fetchall()
    con.close()
    messages = []
    for r in rows:
        messages.append({
            "title": r[0],
            "topic": r[1],
            "date": r[2],
            "category": r[3],
            "message": r[4],
            "newStyle": bool(r[5]),
            "html": bool(r[6])
        })
    return messages

def get_categories():
    _ensure_schema()
    con = _connect()
    cur = con.cursor()
    cur.execute('SELECT name FROM categories')
    rows = cur.fetchall()
    con.close()
    return [r[0] for r in rows]

def delete_all_messages():
    _ensure_schema()
    con = _connect()
    cur = con.cursor()
    cur.execute('DELETE FROM messages')
    con.commit()
    con.close()

def init_db():
    _ensure_schema()
    init_categories()

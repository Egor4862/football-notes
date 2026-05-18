from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

from data import get_messages, insert_message, delete_all_messages, get_categories, init_db, Message

# Инициализация базы
init_db()

app = FastAPI(title="Футбольные заметки")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# index.html и lib
static_path = Path(__file__).parent / "static"
app.mount("/static", StaticFiles(directory=static_path), name="static")

# Чтобы заход сразу открывал index.html
@app.get("/")
def root():
    return FileResponse(static_path / "index.html")


@app.get("/test")
def test():
    return {"message": "Server is running"}

# Сообщения
@app.get("/messages")
def get_messages_controller():
    try:
        msgs = get_messages()
        return JSONResponse(content=msgs)
    except Exception as ex:
        return JSONResponse(content={"error": str(ex)}, status_code=500)

@app.post("/messages")
async def insert_message_controller(msg: Message):
    try:
        insert_message(msg)
        return JSONResponse(content={"res": "OK"})
    except Exception as ex:
        return JSONResponse(content={"error": str(ex)}, status_code=500)

@app.delete("/messages")
def delete_messages_controller():
    try:
        delete_all_messages()
        return JSONResponse(content={"res": "OK"})
    except Exception as ex:
        return JSONResponse(content={"error": str(ex)}, status_code=500)

# Категории
@app.get("/categories")
def get_categories_controller():
    try:
        cats = get_categories()
        return JSONResponse(content=cats)
    except Exception as ex:
        return JSONResponse(content={"error": str(ex)}, status_code=500)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=12345)

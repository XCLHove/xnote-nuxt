import request from "~/utils/request.ts";
import { Note } from "~/interfaces/entity/Note";
import { NotePageDTO } from "~/interfaces/entity/dto/NotePageDTO";
import { Result } from "~/interfaces/Result.ts";

/**
 * 获取一篇笔记
 * @param {Object} object - 参数对象
 * @param {number} object.noteId 笔记id
 * @param {string} object.accessCode 访问码
 */
export function getNoteById({
  noteId,
  accessCode = "",
}: {
  noteId: number | string;
  accessCode?: string;
}) {
  return new Promise<Result<Note>>((resolve, reject) => {
    request
      .get(`/notes/${noteId}`, {
        params: {
          accessCode: accessCode,
        },
      })
      .then(({ data }) => {
        const result = data;
        if (result?.data) {
          result.data.keywords ||= [];
        }
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/**
 * 更新笔记
 * @param {Note} note 笔记信息
 */
export function updateNote(note: Note) {
  return new Promise<Result<Note>>((resolve, reject) => {
    request
      .post("/notes", note)
      .then(({ data }) => {
        resolve(data);
      })
      .catch((error) => reject(error));
  });
}

/**
 * 添加笔记
 * @param {Note} note 笔记信息
 */
export function addNote(note: Note) {
  return new Promise<Result<Note>>((resolve, reject) => {
    request
      .put("/notes", note)
      .then(({ data }) => {
        resolve(data);
      })
      .catch((error) => reject(error));
  });
}

/**
 * 删除笔记
 * @param noteId 笔记id
 */
export function deleteNoteById(noteId: number) {
  return new Promise<Result<void>>((resolve, reject) => {
    request
      .delete(`/notes/${noteId}`)
      .then(({ data }) => {
        resolve(data);
      })
      .catch((error) => reject(error));
  });
}

/**
 * 分页获取所有笔记
 * @param notePageDTO 分页数据
 */
export function pageNote(notePageDTO: NotePageDTO) {
  return new Promise<Result<NotePageDTO>>((resolve, reject) => {
    request
      .post("/notes/page", notePageDTO)
      .then(({ data }) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/**
 * 分页获取自己的笔记
 * @param notePageDTO 分页数据
 */
export function pageSelfNote(notePageDTO: NotePageDTO) {
  return new Promise<Result<NotePageDTO>>((resolve, reject) => {
    request
      .post("/notes/page/me", notePageDTO)
      .then(({ data }) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

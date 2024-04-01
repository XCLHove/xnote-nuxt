import { PageDTO } from "./PageDTO.ts";
import { Note } from "../Note.ts";

/**
 * Note分页数据
 */
export interface NotePageDTO extends PageDTO<Note> {
  userId?: number;
  searchContent: string;
  searchKeyword: string;
  searchTitle: string;
}

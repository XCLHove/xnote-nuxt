import NoteIsPublic from "../../enums/NoteIsPublic.ts";

export interface Note {
  id?: number;
  title: string;
  content: string;
  keywords: string[];
  userId?: number;
  isPublic: NoteIsPublic;
  accessCode?: string;
}

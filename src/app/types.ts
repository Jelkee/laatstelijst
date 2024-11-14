// Define the structure of a User object
export interface User {
    id: string;
    givenName: string;
    familyName: string;
    email: string | null;
    isAdmin: boolean | null;
    createdAt: Date | null;
  }
  
// Define the structure of a Group object
export interface Group {
  id: string;
  name: string;
}

export interface Vote {
  id: number;
  voter: string;
  song: Song;
  points: number;
}

export interface Song {
  id: number;
  title: string;
  artist: string;
  year: number;
}

export interface Submission {
  id: number;
  submittor: string;
  song: Song;
  points: number;
  groupId: string;
}
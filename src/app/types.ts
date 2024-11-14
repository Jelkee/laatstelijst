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
  
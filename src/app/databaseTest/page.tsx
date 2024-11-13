import { DatabaseManager } from "../../db";
import { user } from "../../schema";

// Define the type for the user record
interface User {
    id: number;
    name: string | null;
}

export default async function Page() {
    const db = DatabaseManager.getDatabase();
    
    // Fetch the data with a type annotation
    const res: User[] = await db.select({ id: user.id, name: user.name }).from(user);

    return (
        <div>
            {/* Map through the result and render user names */}
            {res.map((rs: User) => (
                <div key={rs.id}>{rs.name}</div>
            ))}
        </div>
    );
}

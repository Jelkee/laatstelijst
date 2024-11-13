import { DatabaseManager } from "../../db";
import { user } from "../../schema";

// Define the type for the user record
interface User {
    id: number;
    name: string | null;
}

export async function getServerSideProps() {
    try {
        const db = DatabaseManager.getDatabase();

        // Fetch data on the server at request time (not build time)
        const res: User[] = await db.select({ id: user.id, name: user.name }).from(user);

        return {
            props: {
                users: res,
            },
        };
    } catch (error) {
        console.error("Error connecting to the database:", error);
        return {
            props: {
                users: [],
            },
        };
    }
}

export default function Page({ users }: { users: User[] }) {
    return (
        <div>
            {/* Map through the result and render user names */}
            {users.map((user) => (
                <div key={user.id}>{user.name}</div>
            ))}
        </div>
    );
}

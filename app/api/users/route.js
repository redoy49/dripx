import { dbConnect } from "@/app/lib/mongoDb";

// Get all users
export async function GET() {
  try {
    const usersCollection = await dbConnect("users");

    const users = await usersCollection.find({}).toArray();

    return Response.json(users);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// Create user
export async function POST(req) {
  try {
    const body = await req.json();

    const usersCollection = await dbConnect("users");

    const result = await usersCollection.insertOne(body);

    return Response.json(result);
  } catch (error) {
    return Response.json(
      { message: "Failed to create user" },
      { status: 500 }
    );
  }
}

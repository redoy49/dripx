import React from "react";

async function getPosts() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
      next: {
        revalidate: 60,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch posts");
    }

    return await res.json();
  } catch (error) {
    return [];
  }
}

export default async function Page() {
  const posts = await getPosts();

  if (!posts.length) {
    return <h1>No Posts Available</h1>;
  }

  return (
    <main>
      <h1>Total {posts.length} Posts</h1>

      {posts.map((post) => (
        <article key={post.id} className="space-y-4 bg-orange-400 m-3 p-4 rounded-lg">
          <h2>{post.title}</h2>
          <p>{post.body}</p>
        </article>
      ))}
    </main>
  );
}

export default async function Page({ params }) {
  const { id } = await params;

  console.log(id);

  return (
    <div>
      <h1>ID: {id}</h1>
    </div>
  );
}
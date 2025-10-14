import { database, schema } from "@/db";
import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { authentication } from "@/auth";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  let name = formData.get("name");
  let email = formData.get("email");
  if (typeof name !== "string" || typeof email !== "string") {
    return { guestBookError: "Name and email are required" };
  }

  name = name.trim();
  email = email.trim();
  if (!name || !email) {
    return { guestBookError: "Name and email are required" };
  }

  const db = database();
  try {
    await db.insert(schema.guestBook).values({ name, email });
  } catch (error) {
    return { guestBookError: "Error adding to guest book" };
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  const db = database();
  const auth = authentication();

  const guestBook = await db.query.guestBook.findMany({
    columns: {
      id: true,
      name: true,
    },
  });

  const session = await auth.api.getSession({ headers: request.headers });

  return {
    guestBook,
    message: "My message",
    user: session?.user ?? null,
  };
}

export default function Home({ actionData, loaderData }: Route.ComponentProps) {
  return (
    <Welcome
      guestBook={loaderData.guestBook}
      guestBookError={actionData?.guestBookError}
      message={loaderData.message}
      user={loaderData.user}
    />
  );
}

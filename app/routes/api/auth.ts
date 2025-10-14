import { authentication } from "@/auth";
import type { Route } from "./+types/auth";

export async function loader({ request }: Route.LoaderArgs) {
  return authentication().handler(request);
}
export async function action({ request }: Route.ActionArgs) {
  return authentication().handler(request);
}

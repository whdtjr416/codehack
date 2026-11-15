import Dashboard from "./dashboard";
import { getCurrentUser } from "./auth";
export const dynamic="force-dynamic";
export default async function Home(){const user=await getCurrentUser();return <Dashboard signedIn={!!user}/>;}

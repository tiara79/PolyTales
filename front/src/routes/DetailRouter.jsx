import Header from "../components/Header";
import { Outlet } from "react-router-dom";

export default function DetailRouter() {
  return (
    <>
      <Header />
      <main><Outlet /></main>
    </>
  );
}

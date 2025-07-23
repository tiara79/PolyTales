import { Outlet } from "react-router-dom";

export default function NoRoute() {
  return (
    <div className="full-screen">
      <Outlet />
    </div>
  );
}

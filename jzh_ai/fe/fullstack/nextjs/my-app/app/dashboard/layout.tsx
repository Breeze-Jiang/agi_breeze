import Link from "next/link";



export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <div>
      <nav>Nav
        <ul>
          <li>
            <Link href="/dashboard/settings">Settings</Link>
          </li>
        </ul>
      </nav>
      {children}
    </div>
  );
}
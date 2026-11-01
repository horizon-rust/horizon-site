import { HomePage } from "@/components/home-page";
import { pageMetadata, SITE_DESCRIPTION, SITE_TITLE } from "@/components/site";

export const metadata = pageMetadata({ title: SITE_TITLE, description: SITE_DESCRIPTION, path: "/" });

export default function Home() {
  return <HomePage locale="en" />;
}

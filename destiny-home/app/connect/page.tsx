import type { Metadata } from "next";
import DestinyConnectClient from "./DestinyConnectClient";

export const metadata: Metadata = {
  title: "Connect | Destiny Events and Photography",
  description: "Save Destiny Events and Photography to your contacts. Wedding photography, films, events and brand stories from Bengaluru.",
  alternates: { canonical: "/connect" },
  openGraph: {
    title: "Destiny Events and Photography — Connect",
    description: "Photography, films and event production. Get in touch with Destiny.",
    url: "/connect",
    type: "profile",
  },
};

export default function DestinyConnectPage() {
  return <DestinyConnectClient />;
}

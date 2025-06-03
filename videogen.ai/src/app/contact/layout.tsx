import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Contact Us | Videogen.ai - Get in Touch",
  description: "Have questions, feedback, or inquiries? Contact the Videogen.ai team through our contact form or find our contact details here. We're happy to help!",
  keywords: ["contact videogen.ai", "customer support", "technical assistance", "feedback", "AI video generation help"],
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

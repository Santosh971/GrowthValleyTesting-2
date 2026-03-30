import Container from "@/components/Container";
import Section from "@/components/Section";
import Link from "next/link";

export default function NotFound() {
  return (
    <Section className="py-32 md:py-40">
      <Container>
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-heading-1 text-brand-black dark:text-white mb-6">
            Blog Post Not Found
          </h1>
          <p className="text-body-lg text-brand-grey-500 dark:text-brand-grey-400 mb-8">
            Sorry, we couldn't find the blog post you're looking for. It may have been removed or the link might be incorrect.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/blog"
              className="inline-flex items-center justify-center font-semibold uppercase tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-brand-grey-950 bg-accent text-brand-black hover:bg-accent-light focus:ring-accent px-6 py-3 text-sm"
            >
              View All Posts
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center font-semibold uppercase tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-brand-grey-950 border border-brand-grey-300 dark:border-brand-grey-700 text-brand-black dark:text-white hover:bg-brand-grey-100 dark:hover:bg-brand-grey-800 focus:ring-accent px-6 py-3 text-sm"
            >
              Go Home
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  );
}
"use client";
import Link from "next/link";
import BlogSidebar from "../common-blog/BlogSidebar";

import { useEffect, useState } from "react";
import { getData } from "@/libs/server/backendServer";
import { useParams } from "next/navigation";
import { useLocale } from "next-intl";

const BlogDetailsArea = () => {
  const [blog, setBlog] = useState<any>(null);
  const { "blog-slug": slug } = useParams();
  const locale = useLocale();

  useEffect(() => {
    const feachData = async () => {
      try {
        const response = await getData(
          `blogs/${slug}`,
          {},
          {
            lang: locale,
          }
        );
        setBlog(response.data.data.blog);
      } catch (error) {
        throw error;
      }
    };

    feachData();
  }, []);

 

  // Add JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${slug}`,
    },
    headline: blog?.title,
    description: blog?.description?.replace(/<[^>]*>/g, "").substring(0, 160), // Strip HTML tags and limit to 160 chars
    image: blog?.image,
    author: {
      "@type": "Person",
      name: blog?.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Proplix",
      logo: {
        "@type": "ImageObject",
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
      },
    },
    datePublished: blog?.created_at,
    dateModified: blog?.updated_at || blog?.created_at,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="blog-details mt-130 xl-mt-100 pt-100 xl-pt-80 mb-150 xl-mb-100">
        <div className="container">
          <div className="row gx-xl-5">
            <div className="col-lg-8">
              <div className="blog-post-meta mb-60 lg-mb-40">
                <div className="post-info">
                  <Link href="/blog_02">{blog?.author}</Link>
                </div>
                <h3 className="blog-title">{blog?.title}</h3>
              </div>
            </div>
          </div>
          <div className="row gx-xl-5">
            <div className="col-lg-8">
              <article className="blog-post-meta">
                <figure
                  className="post-img position-relative m0"
                  style={{
                    backgroundImage: `url(${blog?.image})`,
                  }}
                >
                  <div className="fw-500 date d-inline-block">
                    {new Date(blog?.created_at)
                      .toLocaleDateString("en-US", {
                        day: "2-digit",
                        month: "short",
                      })
                      .toUpperCase()}
                  </div>
                </figure>
                <div className="post-data pt-50 md-pt-30">
                  <p dangerouslySetInnerHTML={{ __html: blog?.description }} />
                </div>
              </article>
            </div>
            <BlogSidebar style={true} />
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogDetailsArea;

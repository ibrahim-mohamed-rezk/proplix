"use client";
import { Link } from "@/i18n/routing";
import { getData } from "@/libs/server/backendServer";
import { blogFilterTypes, blogTypes } from "@/libs/types/types";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
// import ReactPaginate from "react-paginate";

const BlogThreeArea = () => {
  // featch types
  const [types, setTypes] = useState<blogFilterTypes[]>([]);
  const [blogs, setBlogs] = useState<blogTypes[]>([]);
  const [type, setType] = useState<string>("all");
  const t = useTranslations("blogs");
  const locale = useLocale();

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await getData(
          `types`,
          {},
          {
            lang: locale,
          }
        );
        setTypes(response.data.data);
      } catch (error) {
        console.error("Error fetching types:", error);
      }
    };

    const fetchBlogs = async () => {
      try {
        const response = await getData(
          `blogs?${
            type === "all"
              ? ""
              : `type_id=${types.find((t) => t.title === type)?.id}`
          }`,
          {},
          {
            lang: locale,
          }
        );
        setBlogs(response.data.data);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    };

    fetchTypes();
    fetchBlogs();
  }, [type, locale]);

  return (
    <div className="blog-section-three mt-130 xl-mt-100 mb-150 xl-mb-100">
      <div className="container">
        <div className="blog-filter-nav">
          <ul className="style-none d-flex justify-content-center flex-wrap isotop-menu-wrapper">
            <li
              onClick={() => setType("all")}
              className={type === "all" ? "is-checked" : ""}
            >
              {t("all")}
            </li>
            {types.map((category: blogFilterTypes) => (
              <li
                key={category.id}
                onClick={() => setType(category.title)}
                className={type === category.title ? "is-checked" : ""}
              >
                {category.title}
              </li>
            ))}
          </ul>
        </div>

        <div className="row isotop-gallery-2-wrapper pt-60 lg-pt-40">
          {blogs && blogs.length > 0 ? (
            blogs.map((item: blogTypes) => (
              <div key={item.id} className="col-lg-6">
                <div className="isotop-item villa sale">
                  <article className="blog-meta-one mb-70 lg-mb-40">
                    <figure
                      className={`post-img border-25 position-relative m0`}
                      style={{
                        backgroundImage: `url(${item.cover})`,
                      }}
                    >
                      <Link
                        href={`/blogs/${item.slug}`}
                        className="stretched-link date tran3s"
                      >
                        {new Date(item.created_at)
                          .toLocaleDateString("en-US", {
                            day: "2-digit",
                            month: "short",
                          })
                          .toUpperCase()}
                      </Link>
                    </figure>
                    <div className="post-data">
                      <div className="post-info">
                        <Link href={`/blogs/${item.slug}`}>{item.title}</Link>{" "}
                        {new Date(item.created_at).getHours()} min
                      </div>
                      <div className="d-flex justify-content-between align-items-sm-center flex-wrap">
                        <Link href="/blog_details" className="blog-title">
                          <h4>{item.title}</h4>
                        </Link>
                        <Link
                          href="/blog_details"
                          className="read-btn rounded-circle d-flex align-items-center justify-content-center tran3s"
                        >
                          <i className="bi bi-arrow-up-right"></i>
                        </Link>
                      </div>
                    </div>
                  </article>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center">
              <p className="text-muted">{t("no_blogs_found")}</p>
            </div>
          )}
        </div>

        <div className="pt-20 text-center">
          {/* <ReactPaginate
            breakLabel="..."
            nextLabel={<i className="fa-regular fa-chevron-right"></i>}
            onPageChange={handlePageClick}
            pageRangeDisplayed={5}
            pageCount={pageCount}
            previousLabel={<i className="fa-regular fa-chevron-left"></i>}
            renderOnZeroPageCount={null}
            className="pagination-two d-inline-flex align-items-center justify-content-center style-none"
          /> */}
        </div>
      </div>
    </div>
  );
};

export default BlogThreeArea;

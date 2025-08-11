"use client";
import { Link } from "@/i18n/routing";
import { getData } from "@/libs/server/backendServer";
import { blogFilterTypes, blogTypes } from "@/libs/types/types";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";

const BlogThreeArea = () => {
  // fetch types
  const [types, setTypes] = useState<blogFilterTypes[]>([]);
  const [blogs, setBlogs] = useState<blogTypes[]>([]);
  const [type, setType] = useState<string>(localStorage.getItem("type") || "all");
  const t = useTranslations("endUser");
  const locale = useLocale();
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 1,
    from: 1,
    to: 1,
    has_more_pages: false,
    next_page_url: null,
    prev_page_url: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch types only once on mount
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
    fetchTypes();
  }, [locale]);

  // Fetch blogs when type, locale, or currentPage changes
  useEffect(() => {
    const fetchBlogs = async () => {
      setIsLoading(true);
      try {
        const typeId =
          type === "all"
            ? ""
            : `type_id=${types.find((t) => t.title === type)?.id}`;
        const response = await getData(
          `blogs?${typeId}`,
          { page: currentPage },
          {
            lang: locale,
          }
        );
        setBlogs(response.data.data.items);
        setPagination(response.data.data.pagination);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlogs();
  }, [type, locale, currentPage, types]);

  // Reset to first page when type changes
  useEffect(() => {
    setCurrentPage(1);
  }, [type]);

  // Enhanced pagination: show page numbers, first/last, and disable prev/next at edges
  const handlePageChange = (e: { selected: number }) => {
    setCurrentPage(e.selected + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
          {isLoading ? (
            <div className="col-12 text-center">
              <p className="text-muted">{t("loading") || "Loading..."}</p>
            </div>
          ) : blogs && blogs.length > 0 ? (
            blogs.map((item: blogTypes) => (
              <div key={item.id} className="col-lg-4 col-sm-6">
                <div className="isotop-item villa sale">
                  <article className="blog-meta-one  mb-70 lg-mb-40">
                    <figure
                      className={`post-img   rounded-[24px] position-relative m0`}
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
                        <Link
                          href={`/blogs/${item.slug}`}
                          className="blog-title"
                        >
                          <h4>{item.title}</h4>
                        </Link>
                        <Link
                          href={`/blogs/${item.slug}`}
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

        {pagination.last_page > 1 && (
          <div className="pt-20 text-center">
            <ReactPaginate
              breakLabel="..."
              nextLabel={
                <i
                  className={`fa-regular fa-chevron-right${
                    pagination.current_page === pagination.last_page
                      ? " text-muted"
                      : ""
                  }`}
                ></i>
              }
              previousLabel={
                <i
                  className={`fa-regular fa-chevron-left${
                    pagination.current_page === 1 ? " text-muted" : ""
                  }`}
                ></i>
              }
              onPageChange={handlePageChange}
              pageRangeDisplayed={3}
              marginPagesDisplayed={1}
              pageCount={pagination.last_page}
              forcePage={pagination.current_page - 1}
              renderOnZeroPageCount={null}
              className="pagination-two d-inline-flex align-items-center justify-content-center style-none"
              activeClassName="active"
              disabledClassName="disabled"
              previousClassName={
                pagination.current_page === 1 ? "disabled" : ""
              }
              nextClassName={
                pagination.current_page === pagination.last_page ? "disabled" : ""
              }
            />
            <div className="mt-2 small text-muted">
              {t("page") || "Page"} {pagination.current_page} {t("of") || "of"} {pagination.last_page} &nbsp;|&nbsp;
              {t("total")} {pagination.total} {t("blogs") || "blogs"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogThreeArea;

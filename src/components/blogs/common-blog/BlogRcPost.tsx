import Link from "next/link";

const BlogRcPost = ({ rc_data }: { rc_data: any[] }) => {
  return (
    <div className="recent-news bg-white bg-wrapper mb-30">
      <h5 className="mb-20">Recent News</h5>
      {rc_data?.map((item: any) => (
        <div
          key={item.id}
          className="news-block d-flex align-items-center pb-25"
        >
          <div>
            <img src={item.image} alt="" className="lazy-img w-[70px] h-[70px]" />
          </div>
          <div className="post ps-4 w-full">
            <h4 className="mb-5">
              <Link href={`/blog/${item.slug}`} className="title tran3s">
                {item.title}
              </Link>
            </h4>
            <div className="date">
              {item.created_at
                ? new Date(item.created_at).toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : ""}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BlogRcPost;

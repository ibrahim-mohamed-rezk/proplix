import BlogRcPost from "./BlogRcPost"
import Category from "./Category"
import Tag from "./Tag"

const BlogSidebar = ({rc_data, style}:{rc_data: any[], style: boolean}) => {
   return (
      <div className="col-lg-4">
         <div className={`blog-sidebar dot-bg md-mt-60 ${style?"ms-xxl-4":"ms-xxl-5"}`}>
            {/* <div className="search-form bg-white mb-30">
               <form onSubmit={(e) => e.preventDefault()} className="position-relative">
                  <input type="text" placeholder="Search..." />
                  <button><i className="fa-sharp fa-regular fa-magnifying-glass"></i></button>
               </form>
            </div> */}
            <Category  />
            <BlogRcPost rc_data={rc_data}  />
            <Tag />
         </div>
      </div>
   )
}

export default BlogSidebar

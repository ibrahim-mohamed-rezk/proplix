import { Link, useRouter } from "@/i18n/routing";
import { getData } from "@/libs/server/backendServer";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";

const Category = () => {
  const locale = useLocale();
  const [types, setTypes] = useState([]);
  const router = useRouter();
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

  const filter = (id: any) => {
    localStorage.setItem("type", id);
    router.push("/blogs");
  };

  return (
    <div className="categories bg-white bg-wrapper mb-30">
      <h5 className="mb-20">Category</h5>
      <ul className="style-none">
        {types.map((category: any, i) => (
          <li key={i}>
            <span onClick={()=> filter(category.title)}>{category.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Category;

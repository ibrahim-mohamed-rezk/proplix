import { redirect } from "@/i18n/routing";
import HeaderOne from "@/layouts/headers/HeaderOne";
import { cookies } from "next/headers";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "./components/Sidebar";
import PersonalInformation from "./components/PersonalInformation";
import Wrapper from "@/layouts/Wrapper";
import Favorites from "./components/Favorites";
import SearchHistory from "./components/SearchHistory";

const AccountPage = async ({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { page?: string };
}) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const { locale } = params;
  const { page } = searchParams;

  if (!token) {
    redirect({ href: "/", locale });
  }
  console.log(page);

  return (
    <Wrapper>
      <div className="container min-h-screen">
        <HeaderOne token={token} style={true} />

        <div className="container-fluid pt-[152px]">
          <div className="row">
            <div className="col-lg-3 col-md-4">
              <div
                className="sidebar-wrapper sticky-top"
                style={{ top: "152px" }}
              >
                <Sidebar page={page} />
              </div>
            </div>
            <div className="col-lg-9 col-md-8">
              <div className="card-body p-4">
                {page === "personal-information" && <PersonalInformation />}
                {page === "favorites" && <Favorites properties={[]} />}
                {page === "search-history" && <SearchHistory />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default AccountPage;

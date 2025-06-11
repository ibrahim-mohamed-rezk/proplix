import HomeOne from "@/components/homes/home-one";
import Wrapper from "@/layouts/Wrapper";

export const metadata = {
  title: "Problix - Real Estate React Next js Template",
};
const index = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  return (
    <Wrapper>
      <HomeOne locale={locale} />
    </Wrapper>
  );
};

export default index
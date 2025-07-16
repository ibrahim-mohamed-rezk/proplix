import HeaderOne from '@/layouts/headers/HeaderOne'
import ContactArea from './ContactArea'
import FooterOne from '@/layouts/footers/FooterOne'

const Contact = ({ token }: { token?: string }) => {
   return (
      <>
         <HeaderOne token={token} style={true} />
         <ContactArea />
         <FooterOne />
      </>
   )
}

export default Contact

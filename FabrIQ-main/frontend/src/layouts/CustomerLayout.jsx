import Navbar from "../customer_components/CustomerNavbar";
import Footer from "../customer_components/CustomerFooter";

const CustomerLayout = ({ children }) => {
	return (
		<>
			<Navbar />
			<div className="flex pt-16"> {/* pt-16 = 64px (matches fixed navbar height) */}
  				<div className="flex-1 p-4">
                    {children}
  			    </div>
            </div>
            <Footer/>
		</>
	);
};

export default CustomerLayout;
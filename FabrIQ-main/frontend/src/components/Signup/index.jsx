import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import VerifyOtpModal from "../VerifyOtpModal";

const Signup = () => {
	const [data, setData] = useState({
		first_name: "",
		last_name: "",
		email: "",
		password: "",
		user_type: "customer",
		business_name: "",
		license_image: null,
	});

	const [showVerifyOtp, setShowVerifyOtp] = useState(false);

	const handleChange = ({ currentTarget: input }) => {
		setData({ ...data, [input.name]: input.value });
	};

	const handleFileChange = (e) => {
		setData({ ...data, license_image: e.target.files[0] });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			const formData = new FormData();
			formData.append("first_name", data.first_name);
			formData.append("last_name", data.last_name);
			formData.append("email", data.email);
			formData.append("password", data.password);
			formData.append("user_type", data.user_type);

			if (data.user_type === "business") {
				formData.append("business_name", data.business_name);
				formData.append("license_image", data.license_image);
			}

			const { data: res } = await axios.post("http://localhost:8080/api/users", formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});

			toast.success(res.message);
			localStorage.setItem("email", data.email);
			setShowVerifyOtp(true);
		} catch (error) {
			const msg = error?.response?.data?.message || "Something went wrong";
			toast.error(msg);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
			<div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl grid md:grid-cols-2 overflow-hidden">
				{/* Left Panel */}
				<div className="bg-blue-600 text-white p-8 flex flex-col justify-center">
					<h2 className="text-2xl font-semibold">Already have an account?</h2>
					<p className="mt-2 mb-4">Login to access your dashboard.</p>
					<Link to="/login">
						<button className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-gray-100 transition">
							Login
						</button>
					</Link>
				</div>

				{/* Signup Form */}
				<div className="p-8">
					<form className="flex flex-col gap-4" onSubmit={handleSubmit}>
						<h1 className="text-3xl font-bold text-gray-800">Create Account</h1>

						<select name="user_type" value={data.user_type} onChange={handleChange}
							className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
							<option value="customer">Customer</option>
							<option value="business">Business</option>
						</select>

						<input type="text" placeholder="First Name" name="first_name" value={data.first_name}
							onChange={handleChange} required
							className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />

						<input type="text" placeholder="Last Name" name="last_name" value={data.last_name}
							onChange={handleChange} required
							className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />

						<input type="email" placeholder="Email" name="email" value={data.email}
							onChange={handleChange} required
							className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />

						<input type="password" placeholder="Password" name="password" value={data.password}
							onChange={handleChange} required
							className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />

						{data.user_type === "business" && (
							<>
								<input type="text" placeholder="Business Name" name="business_name"
									value={data.business_name} onChange={handleChange} required
									className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />

								<input type="file" name="license_image" accept="image/*" onChange={handleFileChange} required
									className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4
									file:rounded-md file:border-0 file:text-sm file:font-semibold
									file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
							</>
						)}

						<button type="submit"
							className="bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700 transition">
							Sign Up
						</button>
					</form>
				</div>
			</div>

			<VerifyOtpModal isOpen={showVerifyOtp} onClose={() => setShowVerifyOtp(false)} email={data.email} />
			<ToastContainer position="top-right" autoClose={3000} hideProgressBar />
		</div>
	);
};

export default Signup;

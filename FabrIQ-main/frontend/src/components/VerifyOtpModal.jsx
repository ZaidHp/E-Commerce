import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ModalWrapper from "./ModalWrapper";

const VerifyOtpModal = ({ isOpen, onClose, email }) => {
	const [otp, setOtp] = useState("");
	const [timer, setTimer] = useState(30);
	const [resending, setResending] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		let interval;
		if (isOpen && timer > 0) {
			interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
		}
		return () => clearInterval(interval);
	}, [isOpen, timer]);

	const handleVerify = async (e) => {
		e.preventDefault();
		try {
			const res = await axios.post("http://localhost:8080/api/users/verify", {
				email,
				otp,
			});
			toast.success(res.data.message || "OTP Verified Successfully!");
			setTimeout(() => {
				onClose();
				navigate("/login");
			}, 1500);
		} catch (err) {
			toast.error(err.response?.data.message || "Invalid OTP");
		}
	};

	const handleResend = async () => {
		setResending(true);
		try {
			const res = await axios.post("http://localhost:8080/api/users/resend-otp", { email });
			setTimer(30);
			toast.success(res || "OTP Resent Successfully!");
		} catch (err) {
			toast.error(err ||"Failed to resend OTP");
		}
		setResending(false);
	};

	return (
		<ModalWrapper isOpen={isOpen} onClose={onClose}>
			<form className="space-y-4" onSubmit={handleVerify}>
				<h1 className="text-2xl font-bold text-gray-800">Enter OTP</h1>
				<input
					type="text"
					placeholder="Enter 6-digit OTP"
					value={otp}
					onChange={(e) => setOtp(e.target.value)}
					className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					required
				/>
				<button
					type="submit"
					className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
				>
					Verify
				</button>
				{timer > 0 ? (
					<p className="text-center text-sm text-gray-600">Resend OTP in <strong>{timer}s</strong></p>
				) : (
					<button
						type="button"
						className="w-full text-blue-600 py-2 rounded-md hover:bg-gray-100 transition"
						onClick={handleResend}
						disabled={resending}
					>
						{resending ? "Resending..." : "Resend OTP"}
					</button>
				)}
			</form>
		</ModalWrapper>
	);
};

export default VerifyOtpModal;

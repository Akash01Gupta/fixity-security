import React from 'react'

const page = () => {
    return (
        <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <div className="bg-black/80 text-white shadow overflow-hidden sm:rounded-lg border border-[#1F3D2B]">
                <div className="px-4 py-5 sm:p-6">

                    <h1 className="text-3xl text-center font-bold mb-6 
                    bg-gradient-to-r from-[#B6FF00] to-[#00FF66] 
                    bg-clip-text text-transparent">
                        Privacy Policy
                    </h1>

                    <section className="mb-8">
                        <p className="mb-4 text-gray-300">
                            At FIXI SECURITY, we value your privacy and are committed to protecting your personal data. The privacy and security of our users’ information are critical to our operations. This Privacy Policy explains how we collect, use, and safeguard data when users interact with us via LinkedIn or related platforms. It outlines the types of information collected, the purposes for which it is used, and the measures we implement to ensure its protection. By engaging with us on LinkedIn, users agree to the practices described in this policy.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 
                        bg-gradient-to-r from-[#B6FF00] to-[#00FF66] 
                        bg-clip-text text-transparent">
                            What is Confidential Information?
                        </h2>

                        <p className="text-gray-300 mb-4">
                            Confidential Information refers to any non-public data that we collect, process, or receive during interactions with you, including:
                        </p>

                        <ul className="list-disc list-inside text-gray-300 mb-4">
                            <li><strong className="text-white">Personal Information:</strong> Data that identifies or can be used to identify you, such as your name, email, phone number, or job title.</li>
                            <li><strong className="text-white">Business Information:</strong> Proprietary details about your organization, its operations, or its cybersecurity requirements.</li>
                            <li><strong className="text-white">Communication Details:</strong> Content shared via direct messages, inquiries, or collaborations.</li>
                            <li><strong className="text-white">Usage Data:</strong> Behavioral information gathered during your interactions with our content, ads, or services.</li>
                        </ul>

                        <p className="text-gray-300">
                            We ensure that all collected confidential information is protected and used only for legitimate business purposes.
                        </p>
                    </section>

                    {/* Apply same gradient style to ALL headings below */}

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 
                        bg-gradient-to-r from-[#B6FF00] to-[#00FF66] 
                        bg-clip-text text-transparent">
                            Information We Collect
                        </h2>

                        <h3 className="text-xl font-medium mb-2 
                        bg-gradient-to-r from-[#B6FF00] to-[#00FF66] 
                        bg-clip-text text-transparent">
                            Information Provided by Users
                        </h3>

                        <p className="text-gray-300 mb-4">
                            We collect personal details that users provide voluntarily through direct engagement with our services. Common scenarios include:
                        </p>

                        <ul className="list-disc list-inside text-gray-300 mb-4">
                            <li><strong className="text-white">Account Sign-Ups:</strong> Users may provide details like name, company name, email address, and job title when registering for services or events.</li>
                            <li><strong className="text-white">Forms and Inquiries:</strong> Information submitted through forms, messages, or queries seeking more details about our offerings.</li>
                            <li><strong className="text-white">Subscription Services:</strong> Contact details shared during newsletter sign-ups or promotional event registrations.</li>
                            <li><strong className="text-white">Transaction Information:</strong> Billing and payment details for purchasing our services, which are processed securely through trusted payment systems.</li>
                        </ul>

                        <p className="text-gray-300 mb-4">
                            This data enables us to establish communication and deliver services tailored to the needs of our users.
                        </p>

                        <h3 className="text-xl font-medium mb-2 
                        bg-gradient-to-r from-[#B6FF00] to-[#00FF66] 
                        bg-clip-text text-transparent">
                            Automatically Collected Information
                        </h3>

                        <p className="text-gray-300 mb-4">
                            When users interact with our LinkedIn page or other digital platforms, certain information is collected automatically to optimize user experience and track engagement.
                        </p>

                        <ul className="list-disc list-inside text-gray-300 mb-4">
                            <li><strong className="text-white">Usage Data:</strong> Information such as IP address, browser type, operating system, session duration, and page navigation history.</li>
                            <li><strong className="text-white">Cookies and Tracking Technologies:</strong> Data from cookies, pixels, and similar tools.</li>
                        </ul>

                        <h3 className="text-xl font-medium mb-2 
                        bg-gradient-to-r from-[#B6FF00] to-[#00FF66] 
                        bg-clip-text text-transparent">
                            Third-Party Data Sources
                        </h3>

                        <p className="text-gray-300">
                            We may also gather information from third-party platforms, including LinkedIn.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 
                        bg-gradient-to-r from-[#B6FF00] to-[#00FF66] 
                        bg-clip-text text-transparent">
                            Contact Information
                        </h2>

                        <p className="text-gray-300 mb-4">
                            If you have questions, concerns, or requests regarding this Privacy Policy, please reach out to us at:
                        </p>

                        <p className="text-white mb-2">
                            <strong>Email:</strong>{" "}
                            <a 
                                href="mailto:services@fixisecurity.com" 
                                className="text-[#00FF66] hover:underline"
                            >
                                services@fixisecurity.com
                            </a>
                        </p>

                        <p className="text-gray-300">
                            <strong>Address:</strong> Hanuman Nagar, Kali Mandir Road, Kankarbagh, Patna - 800026
                        </p>

                        <p className="text-gray-300 mt-4">
                            We are committed to addressing user concerns promptly and transparently while maintaining the highest standards of data privacy and protection.
                        </p>
                    </section>

                </div>
            </div>
        </main>
    )
}

export default page;
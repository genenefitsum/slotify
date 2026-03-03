import { Button } from "../ui/button"

const HeroSection = () => {
    return (
        <section className=" ">
            <div className="container mx-auto max-w-full px-8 py-20 bg-gray-200">
                <div className="px-40 ">
                    <h1 className="text-5xl font-bold font-montserrat">Book Trusted <br />Professionals <span className="text-purple-600">in Minutes</span></h1>
                    <p className="py-8 text-gray-500 font-montserrat">Discover, compare, and book service providers across <br /> Ethiopia. Simple, fast and reliable.</p>
                </div>
                <div className="flex flex-wrap gap-3 px-40">
                    <Button className="bg-purple-600 py-6 px-6 text-white rounded-lg hover:bg-purple-700 transition-colors">Browse Services</Button>
                    <Button className="bg-gray-100 py-6 px-6 text-gray-700 rounded-lg hover:bg-green-400 transition-colors">Become a Vendor</Button>
                </div>
                
            </div>
        </section>
    )
}

export default HeroSection 
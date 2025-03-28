import { Instagram } from 'lucide-react';
import Instagram1 from '../assets/instagram1.jpg';
import Instagram2 from '../assets/instagram2.jpg';
import Instagram3 from '../assets/instagram3.jpg';
import Instagram4 from '../assets/instagram4.jpg';
import Instagram5 from '../assets/instagram5.jpg';
import Instagram6 from '../assets/instagram6.jpg';
import Instagram7 from '../assets/instagram3.jpg';
import Instagram8 from '../assets/instagram1.jpg';

const InstagramGallerySection = () => {
  return (
    <section className="my-16 max-w-7xl mx-auto px-4">
      <div className="text-center mb-6">
        <p className="text-gray-600">Share your setup with</p>
        <div className="flex items-center justify-center mt-2">
          <Instagram size={32} className="mr-4" />
          <h2 className="text-3xl font-bold">#Ideal Furniture & Decor</h2>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-2 md:gap-4">
        {/* First column */}
        <div className="col-span-3 space-y-3 md:space-y-4">
          <div className="aspect-[3/5] w-full">
            <img src={Instagram1} alt="Instagram post" className="w-full h-full object-cover" />
          </div>
          <div className="aspect-square w-full">
            <img src={Instagram2} alt="Instagram post" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Second column */}
        <div className="col-span-4 space-y-3 md:space-y-4">
          <div className="aspect-video w-full">
            <img src={Instagram3} alt="Instagram post" className="w-full h-full object-cover" />
          </div>
          <div className="aspect-square w-full">
            <img src={Instagram4} alt="Instagram post" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Third column */}
        <div className="col-span-5 grid grid-cols-5 gap-2 md:gap-4">
          <div className="col-span-3 aspect-[4/3] row-span-2">
            <img src={Instagram5} alt="Instagram post" className="w-full h-full object-cover" />
          </div>
          <div className="col-span-2 aspect-square">
            <img src={Instagram6} alt="Instagram post" className="w-full h-full object-cover" />
          </div>
          <div className="col-span-2 aspect-square">
            <img src={Instagram7} alt="Instagram post" className="w-full h-full object-cover" />
          </div>
          <div className="col-span-5 aspect-[5/2]">
            <img src={Instagram8} alt="Instagram post" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstagramGallerySection;
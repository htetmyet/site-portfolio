import React, { useState } from 'react';
import type { Product } from '../types';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  useRichContent?: boolean;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack, useRichContent = false }) => {
    const images = product.images && product.images.length ? product.images : ['https://picsum.photos/1200/800?random=99'];
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const scrollToContact = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
    };

    const nextImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    };

    return (
        <section className="py-20 animate-fade-in pt-32">
            <div className="container mx-auto px-6">
                <button onClick={onBack} className="mb-8 inline-flex items-center text-brand-primary hover:text-brand-primary/80 font-medium transition-colors group">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to main page
                </button>
                
                <div className="grid md:grid-cols-2 gap-12 items-start">
                    <div>
                        <div className="relative">
                            <img src={images[currentImageIndex]} alt={`${product.title} image ${currentImageIndex + 1}`} className="rounded-lg shadow-2xl w-full h-auto object-cover aspect-[4/3]"/>
                            {images.length > 1 && (
                                <>
                                    <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-secondary">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                    </button>
                                    <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-secondary">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                </>
                            )}
                        </div>
                         {images.length > 1 && (
                            <div className="flex gap-2 mt-4">
                                {images.map((img, index) => (
                                    <img
                                        key={index}
                                        src={img}
                                        alt={`Thumbnail ${index + 1}`}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`w-1/4 h-auto rounded-md cursor-pointer border-2 ${currentImageIndex === index ? 'border-brand-primary' : 'border-transparent'} hover:border-brand-secondary transition-all duration-300 hover:scale-105`}
                                    />
                                ))}
                            </div>
                         )}
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-accent">{product.title}</h1>
                        {useRichContent && product.pageContent ? (
                            <div
                                className="prose max-w-none text-brand-text-muted prose-headings:text-brand-text-dark prose-a:text-brand-primary"
                                dangerouslySetInnerHTML={{ __html: product.pageContent }}
                            />
                        ) : (
                            <p className="text-lg text-brand-text-muted mb-6">{product.longDescription}</p>
                        )}
                        {!useRichContent && (
                            <>
                                <h3 className="text-2xl font-bold mb-4">Key Features</h3>
                                <ul className="space-y-3 text-brand-text-muted">
                                    {product.features.map((feature, index) => (
                                        <li key={index} className="flex items-start">
                                            <span className="flex-shrink-0 w-5 h-5 bg-brand-secondary text-white rounded-full flex items-center justify-center mr-3 mt-1">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                                            </span>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                        <button onClick={scrollToContact} className="mt-8 px-8 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full font-bold text-white hover:scale-105 transform transition-transform duration-300 animate-pulse">
                            Request a Demo
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProductDetail;

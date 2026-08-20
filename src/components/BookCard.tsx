import React, { useState } from 'react';
import { 
  ShoppingBag, 
  BookOpen, 
  Star, 
  Heart, 
  Eye, 
  ShieldCheck, 
  Sparkles, 
  Check,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';
import { Book } from '../types';
import { useStore } from '../context/StoreContext';

interface BookCardProps {
  book: Book;
  onOpenPdfReader?: (book: Book, isSampleOnly: boolean) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onOpenPdfReader }) => {
  const { addToCart, setSelectedBookDetail, setActiveReadingBook } = useStore();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const formatToUse: 'physical' | 'digital' = book.format === 'digital' ? 'digital' : 'physical';
    addToCart(book, formatToUse);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  const handleOpenDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBookDetail(book);
  };

  const handleOpenSample = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenPdfReader) {
      onOpenPdfReader(book, true);
    } else {
      setActiveReadingBook(book);
    }
  };

  const finalPrice = book.hasDiscount && book.discountPrice ? book.discountPrice : book.price;

  return (
    <motion.div 
      onClick={handleOpenDetails}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between overflow-hidden group p-4 relative cursor-pointer"
    >
      
      {/* Top Floating Badges: Quick View & Wishlist */}
      <div className="flex items-center justify-between w-full z-10 mb-2">
        {/* Quick View / Sample button */}
        <button
          onClick={handleOpenSample}
          className="p-1.5 rounded-full bg-slate-100/90 hover:bg-orange-50 hover:text-orange-600 text-slate-500 transition shadow-xs"
          title="قراءة عينة مجانية"
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Format Badge */}
        <div className="flex items-center gap-1">
          {book.format === 'both' && (
            <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-md border border-amber-200">
              ورقي + رقمي ⚡
            </span>
          )}
          {book.format === 'digital' && (
            <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-md border border-indigo-200">
              رقمي PDF 🔒
            </span>
          )}
          {book.format === 'physical' && (
            <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md border border-slate-200">
              ورقي فاخر 📦
            </span>
          )}
        </div>

        {/* Wishlist Heart button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsWishlisted(!isWishlisted);
          }}
          className={`p-1.5 rounded-full transition shadow-xs ${
            isWishlisted 
              ? 'bg-rose-50 text-rose-600' 
              : 'bg-slate-100/90 hover:bg-rose-50 hover:text-rose-600 text-slate-400'
          }`}
          title="إضافة للمفضلة"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>
      </div>

      {/* Book Cover Image with realistic book aspect ratio and drop shadow */}
      <div 
        onClick={handleOpenDetails}
        className="relative my-2 flex items-center justify-center overflow-hidden rounded-xl bg-slate-50 p-2 group-hover:bg-orange-50/30 transition"
      >
        <div className="relative w-36 h-52 sm:w-40 sm:h-56 rounded-lg shadow-md group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300 overflow-hidden border border-slate-200/70">
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          {/* Subtle spine gradient for realistic book depth */}
          <div className="absolute inset-y-0 right-0 w-3 bg-gradient-to-l from-black/20 to-transparent pointer-events-none" />
          
          {/* Discount Ribbon if active */}
          {book.hasDiscount && (
            <div className="absolute top-2 right-2 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-md">
              خصم
            </div>
          )}
        </div>
      </div>

      {/* Book Metadata & Info */}
      <div className="mt-3 space-y-1.5 text-center flex-1 flex flex-col justify-end">
        
        {/* Title */}
        <h3 
          onClick={handleOpenDetails}
          className="font-bold text-slate-900 text-sm sm:text-base line-clamp-1 hover:text-orange-600 transition"
          title={book.title}
        >
          {book.title}
        </h3>

        {/* Author */}
        <p className="text-xs text-slate-500 font-medium line-clamp-1">
          {book.author}
        </p>

        {/* 5-Star Ratings & Review Count */}
        <div className="flex items-center justify-center gap-1.5 pt-0.5">
          <span className="text-[11px] text-slate-400 font-medium">({book.ratingCount || 100})</span>
          <div className="flex items-center text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className="w-3 h-3 fill-amber-400 text-amber-400" 
              />
            ))}
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
          
          {/* Price Display */}
          <div className="text-right">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-orange-600">
                {finalPrice}
              </span>
              <span className="text-xs font-bold text-slate-600">
                جنيه
              </span>
            </div>
            {book.hasDiscount && (
              <span className="text-[10px] text-slate-400 line-through">
                {book.price} جنيه
              </span>
            )}
          </div>

          {/* Orange Shopping Cart Button */}
          <button
            onClick={handleAddToCart}
            className={`p-2.5 rounded-xl transition flex items-center justify-center shadow-xs active:scale-95 ${
              isAdded 
                ? 'bg-emerald-600 text-white' 
                : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
            title="إضافة إلى السلة"
          >
            {isAdded ? (
              <Check className="w-4 h-4" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
          </button>

        </div>

      </div>

    </motion.div>
  );
};

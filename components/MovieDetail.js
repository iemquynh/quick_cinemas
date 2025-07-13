import React, { useState } from "react";

function getYouTubeId(url) {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

export default function MovieDetail({
    background,
    poster,
    title,
    directors,
    cast,
    synopsis,
    runtime,
    releaseDate,
    genre,
    tags,
    trailerUrl,
    onBook
}) {
    const [showTrailer, setShowTrailer] = useState(false);
    const videoId = trailerUrl ? getYouTubeId(trailerUrl) : null;

    return (
        <div className="relative min-h-screen bg-gray-900">
            {/* Video/Background */}
            <div className="w-full relative" style={{ height: 270, backgroundColor: "#111", marginTop: 60 }}>
                {showTrailer && videoId ? (
                    <iframe
                        className="w-full h-full absolute inset-0"
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                        title="Trailer"
                        frameBorder="0"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                    />
                ) : (
                    <>
                        <img
                            src={background}
                            alt={title}
                            className="w-full h-full object-cover"
                            style={{ height: 270 }}
                        />
                        {videoId && (
                            <button
                                className="absolute top-1/2 left-1/2 z-20 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                                onClick={() => setShowTrailer(true)}
                            >
                                <div className="w-20 h-20 bg-black bg-opacity-60 rounded-full flex items-center justify-center hover:bg-opacity-80 transition-all">
                                    <svg className="w-12 h-12 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* Floating Card */}
            <div
                className="absolute left-1/2 -translate-x-1/2 z-30 w-full max-w-6xl"
                style={{ top: 220 }}
            >
                <div className="bg-opacity-95 rounded-lg shadow-2xl px-10 py-8 w-full">
                    <div className="flex flex-row items-start gap-10 mx-auto" style={{ width: 950}}>
                        {/* Poster + Book button */}
                        <div className="flex flex-col items-center flex-shrink-0" style={{ width: 200 }}>
                            <img
                                src={poster}
                                alt={title}
                                className="w-44 h-auto rounded-lg shadow-2xl border-2 border-white"
                            />
                            <button
                                onClick={onBook}
                                className="mt-6 border-2 border-white text-white font-bold py-2 px-8 rounded-lg text-lg transition-colors duration-200 hover:bg-white hover:text-blue-900"
                            >
                                Book tickets
                            </button>
                        </div>
                        {/* Info */}
                        <div className="flex flex-col justify-start" style={{ width: 750 }}>
                            {/* Title + badge */}
                            <div className="flex flex-row items-end gap-3 mb-4">
                                <h1 className="text-4xl font-bold text-white uppercase tracking-wide" style={{textShadow: "0 2px 8px #000"}}>
                                    {title}
                                </h1>
                                {/* Badge age rating nếu có */}
                                <span className="mb-1 inline-block align-middle bg-pink-600 text-white text-xs px-2 py-1 rounded-full">15</span>
                            </div>
                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Left column */}
                                <div className="flex-[1_1_67%]">
                                    <div className="mb-2">
                                        <span className="font-semibold text-gray-300">DIRECTORS</span>
                                        <div className="text-white">{directors}</div>
                                    </div>
                                    <div className="mb-2">
                                        <span className="font-semibold text-gray-300">CAST</span>
                                        <div className="text-white">{cast}</div>
                                    </div>
                                    <div className="mb-2">
                                        <span className="font-semibold text-gray-300">SYNOPSIS</span>
                                        <div className="text-white">{synopsis}</div>
                                    </div>
                                </div>
                                {/* Right column */}
                                <div className="flex-[1_1_35%]">
                                    <div className="mb-2">
                                        <span className="font-semibold text-gray-300">RUNTIME</span>
                                        <div className="text-white">{runtime}</div>
                                    </div>
                                    <div className="mb-2">
                                        <span className="font-semibold text-gray-300">RELEASE DATE</span>
                                        <div className="text-white">{releaseDate}</div>
                                    </div>
                                    <div className="mb-2">
                                        <span className="font-semibold text-gray-300">GENRE</span>
                                        <div>
                                            {genre && genre.split(',').map((g, idx) => (
                                                <span key={idx} className="inline-block border border-white text-white text-xs px-2 py-1 rounded mr-2">{g.trim()}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mb-2">
                                        <span className="font-semibold text-gray-300">TAGS</span>
                                        <div>
                                            {tags && tags.split(',').map((t, idx) => (
                                                <span key={idx} className="inline-block border border-gray-400 text-gray-300 text-xs px-2 py-1 rounded mr-2">{t.trim()}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Spacer để content không bị che */}
            <div style={{height: 200}} />
        </div>
    );
}
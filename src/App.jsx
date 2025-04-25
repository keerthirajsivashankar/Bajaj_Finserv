import React, { useState, useEffect, useRef } from 'react';
import Doctorcard from './doctorcard';
import './App.css';

const API_URL = 'https://srijandubey.github.io/campus-api-mock/SRM-C1-25.json';

function App() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [consultType, setConsultType] = useState('both');
  const [specialities, setSpecialities] = useState([]);
  const [selectedSpecialities, setSelectedSpecialities] = useState([]);
  const [sortBy, setSortBy] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  
  const isInitialMount = useRef(true);

  // Load data from API
  useEffect(() => {
    setIsLoading(true);
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch data');
        }
        return res.json();
      })
      .then((doctors) => {
        setData(doctors);
        
        const uniqueSpecs = [
          ...new Set(
            doctors.flatMap((doc) => 
              doc.specialities && Array.isArray(doc.specialities) 
                ? doc.specialities.map((s) => s?.name || '').filter(Boolean)
                : []
            )
          ),
        ];
        setSpecialities(uniqueSpecs);
        
        loadFiltersFromURL();
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching doctor data:', err);
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSuggestions([]);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const matchedDoctors = data
      .filter(doc => doc.name && doc.name.toLowerCase().includes(searchTermLower))
      .slice(0, 3); 
    
    setSuggestions(matchedDoctors);
  }, [searchTerm, data]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchRef]);

  const loadFiltersFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    
    const search = params.get('search');
    if (search) setSearchTerm(search);
    
    const consult = params.get('consult');
    if (consult && ['both', 'video', 'clinic'].includes(consult)) {
      setConsultType(consult);
    }
    
    const specs = params.get('specialities');
    if (specs) {
      const specsList = specs.split(',').filter(Boolean);
      setSelectedSpecialities(specsList);
    }
    
    const sort = params.get('sort');
    if (sort && ['fees', 'experience'].includes(sort)) {
      setSortBy(sort);
    }
  };

  const updateURLParams = () => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    const params = new URLSearchParams();
    
    if (searchTerm) params.set('search', searchTerm);
    
    if (consultType !== 'both') params.set('consult', consultType);
    
    if (selectedSpecialities.length > 0) {
      params.set('specialities', selectedSpecialities.join(','));
    }
    
    if (sortBy) params.set('sort', sortBy);
    
    const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.pushState({ path: newURL }, '', newURL);
  };

  useEffect(() => {
    const handlePopState = () => {
      loadFiltersFromURL();
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    
    updateURLParams();
    
    let filtered = [...data];

    if (searchTerm.trim() !== '') {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.name && doc.name.toLowerCase().includes(searchTermLower)
      );
    }

    if (consultType === 'video') filtered = filtered.filter((doc) => doc.video_consult);
    else if (consultType === 'clinic') filtered = filtered.filter((doc) => doc.in_clinic);
    else if (consultType === 'both') filtered = filtered.filter((doc) => doc.video_consult || doc.in_clinic);

    if (selectedSpecialities.length > 0) {
      filtered = filtered.filter((doc) =>
        doc.specialities && doc.specialities.some((s) => selectedSpecialities.includes(s.name))
      );
    }

    let sortedData = [...filtered];
    
    if (sortBy === 'fees') {
      sortedData.sort((a, b) => {
        const feeA = a.fees !== undefined && !isNaN(parseFloat(a.fees)) 
          ? parseFloat(a.fees) 
          : Infinity;
          
        const feeB = b.fees !== undefined && !isNaN(parseFloat(b.fees)) 
          ? parseFloat(b.fees) 
          : Infinity;
          
        return feeA - feeB;
      });
    } else if (sortBy === 'experience') {
      sortedData.sort((a, b) => {
        const expA = b.experience !== undefined && !isNaN(parseFloat(b.experience)) 
          ? parseFloat(b.experience) 
          : 0;
          
        const expB = a.experience !== undefined && !isNaN(parseFloat(a.experience)) 
          ? parseFloat(a.experience) 
          : 0;
          
        return expA - expB;  
      });
    }

    setFilteredData(sortedData);
  }, [consultType, selectedSpecialities, sortBy, data, searchTerm]);

  const handleSpecChange = (spec) => {
    setSelectedSpecialities((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (doctorName) => {
    setSearchTerm(doctorName);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };
  
  const clearAllFilters = () => {
    setConsultType('both');
    setSelectedSpecialities([]);
    setSortBy('');
    setSearchTerm('');
  };

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
          <button 
            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex justify-center flex-col items-center w-full">
        <div className="shadow-lg border-blue-600 border-2 bg-blue-600 flex flex-row justify-between items-center p-2 w-full">
          <div className="flex flex-row items-center justify-center ">
            <img src="image.png" alt="" className='w-[50px] h-[50px] rounded-full border-1 border-white mx-2' />
            <h1 className="text-xl text-white font-bold">BAJAJ FINSERV</h1>
          </div>
      {/* Search Bar with Autocomplete */}
        <div className="w-full p-4 shadow-md">
          <div className="max-w-xl mx-auto relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="flex items-center">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search for doctors by name..."
                className="w-full p-3 border bg-white border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                type="submit"
                className="bg-white p-3 rounded-r-lg hover:bg-blue-700 hover:text-white focus:outline-none"
              >
                Search
              </button>
            </form>
            
            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 shadow-lg max-h-60 overflow-auto">
                {suggestions.map((doc, index) => (
                  <div 
                    key={index}
                    className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                    onClick={() => handleSuggestionClick(doc.name)}
                  >
                    <div className="font-medium">{doc.name}</div>
                    <div className="text-sm text-gray-600">
                      {doc.specialities && doc.specialities.length > 0 
                        ? doc.specialities[0].name 
                        : 'General Physician'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

          {/* Share button */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Link copied to clipboard!');
            }}
            className="bg-white text-blue-600 px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-50"
          >
            Share Filters
          </button>
        </div>


        {/* Active Filters Display */}
        {(searchTerm || consultType !== 'both' || selectedSpecialities.length > 0 || sortBy) && (
          <div className="w-full px-4 py-2 bg-blue-50">
            <div className="max-w-3xl mx-auto flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-blue-700 mr-2">Active Filters:</span>
              
              {searchTerm && (
                <span className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  Search: {searchTerm}
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="ml-1 text-blue-500 hover:text-blue-700"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {consultType !== 'both' && (
                <span className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {consultType === 'video' ? 'Video Consult' : 'In Clinic'}
                  <button 
                    onClick={() => setConsultType('both')}
                    className="ml-1 text-blue-500 hover:text-blue-700"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {selectedSpecialities.map(spec => (
                <span key={spec} className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {spec}
                  <button 
                    onClick={() => handleSpecChange(spec)}
                    className="ml-1 text-blue-500 hover:text-blue-700"
                  >
                    ×
                  </button>
                </span>
              ))}
              
              {sortBy && (
                <span className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  Sort: {sortBy === 'fees' ? 'Fees (Low to High)' : 'Experience (High to Low)'}
                  <button 
                    onClick={() => setSortBy('')}
                    className="ml-1 text-blue-500 hover:text-blue-700"
                  >
                    ×
                  </button>
                </span>
              )}
              
              <button 
                onClick={clearAllFilters}
                className="text-xs text-blue-700 hover:text-blue-900 underline ml-auto"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Filters Section */}
        <div className="w-full p-4 grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-100">
          {/* Consult Type Box */}
          <div className="bg-white rounded-xl shadow-md p-4 ">
            <h2 className="text-lg font-bold mb-2">Consult Type</h2>
            <label className="block mb-2 cursor-pointer">
              <input
                type="radio"
                name="consult"
                value="both"
                checked={consultType === 'both'}
                onChange={() => setConsultType('both')}
                className="mr-2"
              />
              <span>Both</span>
            </label>
            <label className="block mb-2 cursor-pointer">
              <input
                type="radio"
                name="consult"
                value="video"
                checked={consultType === 'video'}
                onChange={() => setConsultType('video')}
                className="mr-2"
              />
              <span>Video Consult</span>
            </label>
            <label className="block cursor-pointer">
              <input
                type="radio"
                name="consult"
                value="clinic"
                checked={consultType === 'clinic'}
                onChange={() => setConsultType('clinic')}
                className="mr-2"
              />
              <span>In Clinic</span>
            </label>
          </div>

          {/* Specialities Box with improved scrolling */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <h2 className="text-lg font-bold mb-2">Specialities</h2>
            <div className="overflow-x-auto">
              <div className="flex flex-wrap gap-3">
                {specialities.map((spec, index) => (
                  <label key={index} className="inline-flex items-center whitespace-nowrap cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSpecialities.includes(spec)}
                      onChange={() => handleSpecChange(spec)}
                      className="mr-2"
                    />
                    <span className="text-sm">{spec}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Sort Options Box */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <h2 className="text-lg font-bold mb-2">Sort By</h2>
            <label className="block mb-2 cursor-pointer">
              <input
                type="radio"
                name="sortBy"
                value=""
                checked={sortBy === ''}
                onChange={() => setSortBy('')}
                className="mr-2"
              />
              <span>None</span>
            </label>
            <label className="block mb-2 cursor-pointer">
              <input
                type="radio"
                name="sortBy"
                value="fees"
                checked={sortBy === 'fees'}
                onChange={() => setSortBy('fees')}
                className="mr-2"
              />
              <span>Fees (Low to High)</span>
            </label>
            <label className="block cursor-pointer">
              <input
                type="radio"
                name="sortBy"
                value="experience"
                checked={sortBy === 'experience'}
                onChange={() => setSortBy('experience')}
                className="mr-2"
              />
              <span>Experience (High to Low)</span>
            </label>
          </div>
        </div>

        {/* Loading indicator */}
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          /* Cards Section */
          <div className="p-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 w-full">
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <Doctorcard key={index} data={item} />
              ))
            ) : (
              <div className="col-span-full text-center p-8 bg-gray-50 rounded-lg">
                <p className="text-lg text-gray-500">No doctors match your current filters.</p>
                <button 
                  onClick={clearAllFilters}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default App;
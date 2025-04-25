import React from 'react';

const Doctorcard = ({ data }) => {
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-4 m-4 w-[350px] transition-all hover:scale-105 duration-300">
      {/* Top Section */}
      <div className="flex items-center space-x-4">
        <img
          src={data.photo}
          alt={data.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
        />
        <div>
          <h3 className="font-bold text-lg text-gray-800">{data.name}</h3>
          <p className="text-sm text-gray-500">{data.experience}</p>
        </div>
      </div>

      {/* Introduction */}
      <p className="text-sm text-gray-600 mt-3 line-clamp-4">
        {data.doctor_introduction || 'No introduction available.'}
      </p>

      {/* Specialities */}
      <div className="mt-4">
        <h4 className="font-semibold text-sm text-gray-700">Specialities:</h4>
        <ul className="list-disc list-inside text-sm text-gray-600">
          {data.specialities.map((spec, index) => (
            <li key={index}>{spec.name}</li>
          ))}
        </ul>
      </div>

      {/* Fees & Languages */}
      <div className="mt-4 flex justify-between text-sm text-gray-700">
        <div>
          <p><strong>Fees:</strong> {data.fees}</p>
        </div>
        <div>
          <p><strong>Languages:</strong></p>
          <ul className="text-xs text-gray-500">
            {data.languages.map((lang, index) => (
              <li key={index}>{lang}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Clinic Info */}
      <div className="mt-4 flex items-start">
        {data.clinic.logo_url && (
          <img
            src={data.clinic.logo_url}
            alt="Clinic logo"
            className="w-10 h-10 rounded-full border mr-3"
          />
        )}
        <div>
          <p className="font-medium text-sm">{data.clinic.name}</p>
          <p className="text-xs text-gray-500">{data.clinic.address.address_line1}</p>
          <p className="text-xs text-gray-500">{data.clinic.address.city}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex gap-2">
        {data.video_consult && (
          <button className="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700">
            Video Consult
          </button>
        )}
        {data.in_clinic && (
          <button className="bg-green-600 text-white text-xs px-3 py-1 rounded hover:bg-green-700">
            In Clinic
          </button>
        )}
      </div>
    </div>
  );
};

export default Doctorcard;

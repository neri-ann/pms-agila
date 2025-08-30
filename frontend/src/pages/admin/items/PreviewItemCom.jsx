import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "../../../styles/button2.css";

export default function PreviewItemCom() {
  const [items, setItems] = useState({});
  const { id } = useParams();

  useEffect(() => {
    const getItem = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/item/preview-item/${id}`
        );
        console.log("Item Data:", response.data);
        setItems(response.data);
      } catch (error) {
        console.log("Error fetching item:", error);
      }
    };

    getItem();
  }, [id]);

  const navigate = useNavigate();

  const handleClose = () => {
    navigate("/allitems");
  };

  return (
    <div className="App">
      <section id="content">
        <main>
          <div className="p-4">
            <div className="min-h-screen flex items-center justify-center px-4">
              <div
                className="max-w-2xl mx-auto  bg-white w-full rounded-lg shadow-xl p-8"
                style={{ border: "4px solid #3490dc" }}
              >
                <div className="p-3 border-b">
                  <h1 className="font-medium text-2xl">Item Details</h1>
                </div>
                <div>
                  <style>
                    {`
                        @media (max-width: 280px) {
                          .md\:grid {
                            grid-template-columns: 1fr;
                          }
                          .md\:grid-cols-2 {
                            grid-template-columns: 1fr;
                          }
                          .md\:space-y-0 {
                            grid-row-gap: 0;
                          }
                          .md\:space-y-1 {
                            grid-row-gap: 0.25rem;
                          }
                          .md\:hover\:bg-gray-50:hover {
                            background-color: #f9fafb;
                          }
                          .md\:p-2 {
                            padding: 0.5rem;
                          }
                          .md\:border-b {
                            border-bottom-width: 1px;
                          }
                          .md\:bg-gray-50 {
                            background-color: #f9fafb;
                          }

                          .md\:grid-cols-2 .text-black-900,
                          .md\:grid-cols-2 .text-gray-600 {
                            display: block;
                          }
                        }
                      `}
                  </style>
                  
                  {/* Item Name */}
                  <div className="md:grid md:grid-cols-2 hover:bg-gray-50 md:space-y-0 space-y-1 p-2 border-b bg-gray-50">
                    <span className="text-xl md:mr-4 text-black-900 font-bold block sm:inline">
                      Item Name:
                    </span>
                    <span className="text-xl mr-4 text-gray-600">
                      {items.itemName || 'N/A'}
                    </span>
                  </div>

                  {/* Assets Class */}
                  <div className="md:grid md:grid-cols-2 hover:bg-gray-50 md:space-y-0 space-y-1 p-2 border-b">
                    <span className="text-xl md:mr-4 text-black-900 font-bold block sm:inline">
                      Assets Class:
                    </span>
                    <span className="text-xl md:mr-4 text-gray-600">
                      {items.AssetsClass || 'N/A'}
                    </span>
                  </div>

                  {/* Assets Sub Class */}
                  <div className="md:grid md:grid-cols-2 hover:bg-gray-50 md:space-y-0 space-y-1 p-2 border-b bg-gray-50">
                    <span className="text-xl md:mr-4 text-black-900 font-bold block sm:inline">
                      Assets Sub Class:
                    </span>
                    <span className="text-xl md:mr-4 text-gray-600">
                      {items.AssetsSubClass || 'N/A'}
                    </span>
                  </div>

                  {/* Item Description */}
                  <div className="md:grid md:grid-cols-2 hover:bg-gray-50 md:space-y-0 space-y-1 p-2 border-b">
                    <span className="text-xl md:mr-4 text-black-900 font-bold block sm:inline">
                      Item Description:
                    </span>
                    <span className="text-xl md:mr-4 text-gray-600">
                      {items.itemDescription || 'N/A'}
                    </span>
                  </div>

                  {/* Cost */}
                  <div className="md:grid md:grid-cols-2 hover:bg-gray-50 md:space-y-0 space-y-1 p-2 border-b bg-gray-50">
                    <span className="text-xl md:mr-4 text-black-900 font-bold block sm:inline">
                      Cost (₱):
                    </span>
                    <span className="text-xl mr-4 font-semibold text-green-600">
                      ₱{items.cost ? parseFloat(items.cost).toLocaleString() : '0.00'}
                    </span>
                  </div>

                  {/* Quantity Available */}
                  <div className="md:grid md:grid-cols-2 hover:bg-gray-50 md:space-y-0 space-y-1 p-2 border-b">
                    <span className="text-xl md:mr-4 text-black-900 font-bold block sm:inline">
                      Quantity Available:
                    </span>
                    <span className="text-xl mr-4 font-semibold text-blue-600">
                      {items.calculatedQuantityAvailable || items.quantityAvailable || 0}
                    </span>
                  </div>

                  {/* Created At */}
                  <div className="md:grid md:grid-cols-2 hover:bg-gray-50 md:space-y-0 space-y-1 p-2 border-b bg-gray-50">
                    <span className="text-xl md:mr-4 text-black-900 font-bold block sm:inline">
                      Created At:
                    </span>
                    <span className="text-xl mr-4 text-gray-600">
                      {items.createdAt ? new Date(items.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>

                  {/* Updated At */}
                  <div className="md:grid md:grid-cols-2 hover:bg-gray-50 md:space-y-0 space-y-1 p-2 border-b">
                    <span className="text-xl md:mr-4 text-black-900 font-bold block sm:inline">
                      Updated At:
                    </span>
                    <span className="text-xl mr-4 text-gray-600">
                      {items.updatedAt ? new Date(items.updatedAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>

                  <div class="space-x-4 mt-8 text-center ">
                    <button onClick={handleClose} className="button-71">
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </section>
    </div>
  );
}

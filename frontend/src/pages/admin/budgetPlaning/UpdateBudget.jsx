import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";

const departmentOptions = [
  "DEIE",
  "DCEE",
  "DMME",
  "DCE",
  "DMNNE",
  "DIS",
  "NONE",
];

export default function UpdateBudget() {
  const [department, setDepartment] = useState("");
  const [budgetAllocation, setBudgetAllocation] = useState("");
  const [availableBalance, setAvailableBalance] = useState("");
  const [usedAmount, setUsedAmount] = useState("");

  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:8000/budget/previewBudget/${id}`)
      .then((response) => {
        const budgetData = response.data;
        setDepartment(budgetData.department);
        setBudgetAllocation(budgetData.budgetAllocation);
        setAvailableBalance(budgetData.availableBalance);
        setUsedAmount(budgetData.usedAmount);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        enqueueSnackbar("An error occurred. Please check the console.", {
          variant: "error",
        });
        console.error(error);
      });
  }, [id, enqueueSnackbar]);

  const handleUpdateBudgets = (e) => {
    e.preventDefault();
    const updatedBudget = {
      department,
      budgetAllocation,
      availableBalance,
      usedAmount,
    };

    setLoading(true);

    axios
      .put(`http://localhost:8000/budget/updateBudget/${id}`, updatedBudget)
      .then(() => {
        setLoading(false);
        enqueueSnackbar("Budget updated successfully", {
          variant: "success",
        });
        navigate("/ManageBudget");
      })
      .catch((error) => {
        setLoading(false);
        enqueueSnackbar(`Error updating budget: ${error.message}`, {
          variant: "error",
        });
        console.error(error);
      });
  };

  return (
    <form onSubmit={handleUpdateBudgets} className="space-y-12 p-8">
      <h2 className="text-2xl">Update Budget</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Department
          </label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="" disabled>
              Select department
            </option>
            {departmentOptions.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Budget Allocation
          </label>
          <input
            type="number"
            value={budgetAllocation}
            onChange={(e) => setBudgetAllocation(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Available Balance
          </label>
          <input
            type="number"
            value={availableBalance}
            onChange={(e) => setAvailableBalance(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Used Amount
          </label>
          <input
            type="number"
            value={usedAmount}
            onChange={(e) => setUsedAmount(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={() => navigate("/ManageBudgets")}
          className="rounded-md h-12 w-24 bg-[#404040] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-black"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md bg-[#961C1E] h-12 w-24 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#761C1D]"
        >
          Save
        </button>
      </div>
    </form>
  );
}

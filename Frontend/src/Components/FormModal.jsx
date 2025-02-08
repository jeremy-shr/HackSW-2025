import React, { useState } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Typography from "@mui/material/Typography";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  maxHeight: "80vh",
  overflowY: "auto",
};

const options = {
  street_type: {
    0: "Road",
    1: "Lane",
    2: "Other",
    3: "Trail",
    4: "Drive",
  },
  fire_unit: {
    0: "LNU",
    1: "AEU",
    2: "BTU",
    3: "SLU",
  },
  structure_type: {
    0: "Single Family Residence Multi Story",
    1: "Single Family Residence Single Story",
    2: "Utility Misc Structure",
  },
  structure_category: {
    0: "Single Residence",
    1: "Other Minor Structure",
    2: "Multiple Residence",
  },
  roof_material: {
    0: "Asphalt",
    1: "Tile",
    2: "Unknown",
  },
  eaves: {
    0: "Unenclosed",
    1: "Enclosed",
    2: "Unknown",
  },
  exterior_siding: {
    0: "Wood",
    1: "Stucco Brick Cement",
    2: "Unknown",
  },
  window_pane: {
    0: "Single Pane",
    1: "Multi Pane",
    2: "Unknown",
  },
  attached_patio_material: {
    0: "No Patio Cover/Carport",
    1: "Combustible",
    2: "Unknown",
  },
  attached_fence_material: {
    0: "No Fence",
    1: "Combustible",
    2: "Unknown",
  },
};

function FormModal({ open, handleClose }) {
  const [formData, setFormData] = useState(
    Object.keys(options).reduce((acc, key) => ({ ...acc, [key]: "" }), {})
  );

  const handleChange = (event, field) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleSubmit = () => {
    console.log("Form Data:", formData);
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="form-modal">
      <Box sx={style}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Select Options
        </Typography>

        {Object.entries(options).map(([key, values]) => (
          <FormControl fullWidth sx={{ mb: 2 }} key={key}>
            <InputLabel>{key.replace("_", " ").toUpperCase()}</InputLabel>
            <Select value={formData[key]} onChange={(e) => handleChange(e, key)}>
              {Object.entries(values).map(([value, label]) => (
                <MenuItem key={value} value={label}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ))}

        <Button variant="contained" color="primary" fullWidth onClick={handleSubmit}>
          Submit
        </Button>
      </Box>
    </Modal>
  );
}

export default FormModal;

import Layout from "@/Components/Layout";
import { BackofficeContext } from "@/Contents/BackofficeContext";
import { config } from "@/config/config";
import { getLocationId, getMenusIdFromMenuMenuCategoryLocation } from "@/utils";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import DeleteDialog from "@/Components/DeleteDialog";
import { useAppSelector } from "@/store/hooks";
import { appData } from "@/store/slices/appSlice";

const EditAddon = () => {
  const router = useRouter();
  const addonId = router.query.id as string;
  const selectedLocationId = getLocationId() as string;
  const { addons, menuMenuCategoriesLocations, menuAddons, addonCategories } =
    useAppSelector(appData);

  const addon = addons.find((addon) => addon.id === parseInt(addonId, 10));
  const [open, setOpen] = useState(false);
  //get menuId from menulocatios
  const locationMenuIds = getMenusIdFromMenuMenuCategoryLocation(
    selectedLocationId,
    menuMenuCategoriesLocations
  );

  const addoncategoryMenuIds = menuAddons
    .filter((item) => locationMenuIds.includes(item.menu_id))
    .map((item) => item.addon_category_id);

  const locationAddonCategories = addonCategories.filter((item) =>
    addoncategoryMenuIds.includes(item.id)
  );

  //selected addoncategory
  const selectedAddonCategory = addonCategories
    .filter((item) => addon && item.id === addon.addon_category_id)
    .map((item) => ({ id: item.id, label: item.name }));

  const [selected, setSelected] = useState(selectedAddonCategory);

  //update new addon
  const [newAddon, setNewAddon] = useState({
    id: Number(addonId),
    name: addon?.name,
    price: addon?.price,
    addonCategoryId: addon?.addon_category_id,
  });

  useEffect(() => {
    if (addon) {
      setNewAddon({
        id: Number(addonId),
        name: addon.name,
        price: addon.price,
        addonCategoryId: addon.addon_category_id,
      });
    }
  }, [addon]);

  const updateAddon = async () => {
    try {
      await fetch(`${config.apiBaseUrl}/addons`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddon),
      });
      //  fetchData();
      router.back();
    } catch (err) {
      console.log(err);
    }
  };

  //delete || archive
  const deleteAddon = async () => {
    await fetch(`${config.apiBaseUrl}/addons?id=${addonId}`, {
      method: "DELETE",
    });
    // fetchData();
    setOpen(false);
    router.back();
  };
  return (
    <Layout title="Edit Addon">
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          onClick={() => setOpen(true)}
          variant="contained"
          sx={{
            backgroundColor: "#820000",
            ":hover": { bgcolor: "#820000" },
          }}
          startIcon={<DeleteIcon />}
        >
          Delete
        </Button>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {addon && (
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <TextField
              label="Name"
              sx={{ width: 350, mb: 2 }}
              defaultValue={addon.name}
              onChange={(e) =>
                setNewAddon({ ...newAddon, name: e.target.value })
              }
            />
            <TextField
              label="price"
              type="number"
              sx={{ width: 350 }}
              defaultValue={addon.price}
              onChange={(e) =>
                setNewAddon({ ...newAddon, price: Number(e.target.value) })
              }
            />
            <FormControl sx={{ mt: 2, width: 350 }} size="medium">
              <InputLabel id="demo-select-small-label">
                AddonCategory
              </InputLabel>
              <Select
                label="AddonCategory"
                defaultValue={addon.addon_category_id}
                onChange={(e) => {
                  setNewAddon({
                    ...newAddon,
                    addonCategoryId: Number(e.target.value),
                  });
                }}
              >
                {locationAddonCategories.map((item) => {
                  return (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Box>
        )}

        <Button
          variant="contained"
          onClick={updateAddon}
          sx={{ width: "fit-content", mt: 2 }}
        >
          Update
        </Button>
      </Box>
      <DeleteDialog
        open={open}
        setOpen={setOpen}
        title="Addon"
        deleteFun={deleteAddon}
      />
    </Layout>
  );
};

export default EditAddon;

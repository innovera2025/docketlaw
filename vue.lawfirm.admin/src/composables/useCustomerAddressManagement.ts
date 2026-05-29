import { computed, ref } from 'vue'
import { push } from 'notivue'
import {
  searchAddressByProvince,
  searchAddressByAmphoe,
  searchAddressByTambon,
  type Address,
} from 'thailand-address-database'

export interface CustomerAddressType {
  customer_id: number
  id?: number
  name: string
  address: string
  sub_district: string
  district: string
  province: string
  postcode: string
  tel: string
  is_default_address: boolean
  is_default_doc: boolean
}

export const useCustomerAddressManagement = () => {
  // Address modals
  const openAddressModal = ref(false)
  const openDeleteAddress = ref(false)
  const selectedAddress = ref<CustomerAddressType | null>(null)
  const isEditMode = ref(false)

  const formAddress = ref<CustomerAddressType>({
    customer_id: 0,
    name: '',
    address: '',
    sub_district: '',
    district: '',
    province: '',
    postcode: '',
    tel: '',
    is_default_address: false,
    is_default_doc: false,
  })

  const formAddressError = ref({
    name: '',
    address: '',
    sub_district: '',
    district: '',
    province: '',
    postcode: '',
    tel: '',
  })

  // Get all unique provinces from database
  const getAllProvinces = () => {
    // Return complete list of all 77 provinces in Thailand
    return [
      'กรุงเทพมหานคร',
      'กระบี่',
      'กาญจนบุรี',
      'กาฬสินธุ์',
      'กำแพงเพชร',
      'ขอนแก่น',
      'จันทบุรี',
      'ฉะเชิงเทรา',
      'ชลบุรี',
      'ชัยนาท',
      'ชัยภูมิ',
      'ชุมพร',
      'เชียงราย',
      'เชียงใหม่',
      'ตรัง',
      'ตราด',
      'ตาก',
      'นครนายก',
      'นครปฐม',
      'นครพนม',
      'นครราชสีมา',
      'นครศรีธรรมราช',
      'นครสวรรค์',
      'นนทบุรี',
      'นราธิวาส',
      'น่าน',
      'บึงกาฬ',
      'บุรีรัมย์',
      'ปทุมธานี',
      'ประจวบคีรีขันธ์',
      'ปราจีนบุรี',
      'ปัตตานี',
      'พระนครศรีอยุธยา',
      'พังงา',
      'พัทลุง',
      'พิจิตร',
      'พิษณุโลก',
      'เพชรบุรี',
      'เพชรบูรณ์',
      'แพร่',
      'พะเยา',
      'ภูเก็ต',
      'มหาสารคาม',
      'มุกดาหาร',
      'แม่ฮ่องสอน',
      'ยะลา',
      'ยโสธร',
      'ร้อยเอ็ด',
      'ระนอง',
      'ระยอง',
      'ราชบุรี',
      'ลพบุรี',
      'ลำปาง',
      'ลำพูน',
      'เลย',
      'ศรีสะเกษ',
      'สกลนคร',
      'สงขลา',
      'สตูล',
      'สมุทรปราการ',
      'สมุทรสงคราม',
      'สมุทรสาคร',
      'สระแก้ว',
      'สระบุรี',
      'สิงห์บุรี',
      'สุโขทัย',
      'สุพรรณบุรี',
      'สุราษฎร์ธานี',
      'สุรินทร์',
      'หนองคาย',
      'หนองบัวลำภู',
      'อ่างทอง',
      'อำนาจเจริญ',
      'อุดรธานี',
      'อุตรดิตถ์',
      'อุทัยธานี',
      'อุบลราชธานี',
    ]
  }

  // Dynamic options
  const provinceOptions = ref<{ name: string; value: string }[]>([])
  const districtOptions = ref<{ name: string; value: string }[]>([])
  const subDistrictOptions = ref<{ name: string; value: string }[]>([])
  const postalCodeOptions = ref<{ name: string; value: string }[]>([])

  // Functions to handle cascading selections
  const onProvinceChange = async () => {
    if (!formAddress.value.province) {
      districtOptions.value = []
    } else {
      try {
        const results = searchAddressByProvince(formAddress.value.province, 1000)
        const uniqueDistricts = [...new Set(results.map((addr) => addr.amphoe))]
        districtOptions.value = uniqueDistricts.map((district) => ({
          name: district,
          value: district,
        }))
      } catch (error) {
        console.error('Error loading districts:', error)
        districtOptions.value = []
      }
    }
    formAddress.value.district = ''
    await onDistrictChange()
  }

  const onDistrictChange = async () => {
    if (!formAddress.value.district || !formAddress.value.province) {
      subDistrictOptions.value = []
    } else {
      try {
        const results = searchAddressByAmphoe(formAddress.value.district, 1000)
        const filteredResults = results.filter(
          (addr) => addr.province === formAddress.value.province,
        )
        const uniqueSubDistricts = [...new Set(filteredResults.map((addr) => addr.tambon))]
        subDistrictOptions.value = uniqueSubDistricts.map((subDistrict) => ({
          name: subDistrict,
          value: subDistrict,
        }))
      } catch (error) {
        console.error('Error loading sub-districts:', error)
        subDistrictOptions.value = []
      }
    }
    formAddress.value.sub_district = ''
    await onSubDistrictChange()
  }

  const onSubDistrictChange = async () => {
    if (
      !formAddress.value.sub_district ||
      !formAddress.value.district ||
      !formAddress.value.province
    ) {
      postalCodeOptions.value = []
    } else {
      try {
        const results = searchAddressByTambon(formAddress.value.sub_district, 1000)
        const filteredResults = results.filter(
          (addr) =>
            addr.province === formAddress.value.province &&
            addr.amphoe === formAddress.value.district,
        )
        const uniquePostalCodes = [...new Set(filteredResults.map((addr) => addr.zipcode))]
        postalCodeOptions.value = uniquePostalCodes.map((postalCode) => ({
          name: postalCode,
          value: postalCode,
        }))

        // Auto-select postal code if only one option
        if (uniquePostalCodes.length === 1) {
          formAddress.value.postcode = uniquePostalCodes[0]
        }
      } catch (error) {
        console.error('Error loading postal codes:', error)
        postalCodeOptions.value = []
      }
    }
  }

  // Initialize options
  const initializeGeographyOptions = async () => {
    try {
      const allProvinces = getAllProvinces()
      provinceOptions.value = allProvinces.map((prov) => ({ name: prov, value: prov }))
      // Reset other options to empty
      districtOptions.value = []
      subDistrictOptions.value = []
      postalCodeOptions.value = []
    } catch (error) {
      console.error('Error loading provinces:', error)
      provinceOptions.value = []
      districtOptions.value = []
      subDistrictOptions.value = []
      postalCodeOptions.value = []
    }
  }

  // Address management functions
  const handleAddAddress = () => {
    isEditMode.value = false
    selectedAddress.value = null
    formAddress.value = {
      customer_id: 0,
      name: '',
      address: '',
      sub_district: '',
      district: '',
      province: '',
      postcode: '',
      tel: '',
      is_default_address: false,
      is_default_doc: false,
    }
    formAddressError.value = {
      name: '',
      address: '',
      sub_district: '',
      district: '',
      province: '',
      postcode: '',
      tel: '',
    }
    initializeGeographyOptions()
    openAddressModal.value = true
  }

  const handleEditAddress = async (address: CustomerAddressType) => {
    isEditMode.value = true
    selectedAddress.value = address
    formAddress.value = { ...address }
    formAddressError.value = {
      name: '',
      address: '',
      sub_district: '',
      district: '',
      province: '',
      postcode: '',
      tel: '',
    }

    // Initialize with all provinces
    await initializeGeographyOptions()

    // Set correct values after cascade initialization
    if (address.province) {
      formAddress.value.province = address.province
      await onProvinceChange()

      if (address.district) {
        formAddress.value.district = address.district
        await onDistrictChange()

        if (address.sub_district) {
          formAddress.value.sub_district = address.sub_district
          await onSubDistrictChange()

          if (address.postcode) {
            formAddress.value.postcode = address.postcode
          }
        }
      }
    }

    openAddressModal.value = true
  }

  const handleDeleteAddressConfirm = (address: CustomerAddressType) => {
    selectedAddress.value = address
    openDeleteAddress.value = true
  }

  const validateAddressForm = () => {
    formAddressError.value.name = formAddress.value.name ? '' : 'กรุณากรอกชื่อที่อยู่'
    formAddressError.value.address = formAddress.value.address ? '' : 'กรุณากรอกที่อยู่'
    formAddressError.value.province = formAddress.value.province ? '' : 'กรุณาเลือกจังหวัด'
    formAddressError.value.district = formAddress.value.district ? '' : 'กรุณาเลือกอำเภอ'
    formAddressError.value.sub_district = formAddress.value.sub_district ? '' : 'กรุณาเลือกตำบล'
    formAddressError.value.postcode = formAddress.value.postcode ? '' : 'กรุณากรอกรหัสไปรษณีย์'

    return (
      !formAddressError.value.name &&
      !formAddressError.value.address &&
      !formAddressError.value.province &&
      !formAddressError.value.district &&
      !formAddressError.value.sub_district &&
      !formAddressError.value.postcode
    )
  }

  return {
    // State
    openAddressModal,
    openDeleteAddress,
    selectedAddress,
    isEditMode,
    formAddress,
    formAddressError,

    // Options
    provinceOptions,
    districtOptions,
    subDistrictOptions,
    postalCodeOptions,

    // Functions
    onProvinceChange,
    onDistrictChange,
    onSubDistrictChange,
    initializeGeographyOptions,
    handleAddAddress,
    handleEditAddress,
    handleDeleteAddressConfirm,
    validateAddressForm,
    getAllProvinces,
  }
}

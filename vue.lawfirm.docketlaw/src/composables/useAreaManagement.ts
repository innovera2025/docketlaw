import { computed, ref } from 'vue'
import { push } from 'notivue'
import {
  searchAddressByProvince,
  searchAddressByAmphoe,
  searchAddressByTambon,
  type Address,
} from 'thailand-address-database'
import { API } from '@/api'
import { useRoute } from 'vue-router'

const route = useRoute()

export interface AreaType {
  number: number
  condition: string
  region: string
  province: string
  district: string
  sub_district: string
  postcode: string
  is_active: boolean
}

export const useAreaManagement = () => {
  // Area modals
  const openAreaModal = ref(false)
  const openDeleteArea = ref(false)
  const selectedArea = ref<AreaType | null>(null)
  const isEditMode = ref(false)

  const formArea = ref({
    condition: 'พื้นที่รับผิดชอบ',
    region: 'ทุกภาค',
    province: 'ทุกจังหวัด',
    district: 'ทุกอำเภอ',
    sub_district: 'ทุกตำบล',
    postcode: 'ทุกรหัสไปรษณีย์',
    is_active: true,
  })

  const formAreaError = ref({
    condition: '',
    region: '',
    province: '',
    district: '',
    sub_district: '',
    postcode: '',
    is_active: '',
  })

  // Geography data and options
  const regions = ref([
    { name: 'ทุกภาค', value: 'ทุกภาค' },
    { name: 'เหนือ', value: 'เหนือ' },
    { name: 'ใต้', value: 'ใต้' },
    { name: 'ตะวันออก', value: 'ตะวันออก' },
    { name: 'ตะวันตก', value: 'ตะวันตก' },
    { name: 'กลาง', value: 'กลาง' },
    { name: 'ตะวันออกเฉียงเหนือ', value: 'ตะวันออกเฉียงเหนือ' },
  ])

  // Get all unique provinces from database
  const getAllProvinces = () => {
    try {
      // ใช้การค้นหาด้วยคำที่น่าจะพบในทุกจังหวัด เช่น "อำเภอ"
      const results1 = searchAddressByAmphoe('เมือง', 1000) // ค้นหาอำเภอเมือง
      const results2 = searchAddressByTambon('', 2000) // ค้นหาตำบลทั้งหมด
      const allResults = [...results1, ...results2]
      const uniqueProvinces = [...new Set(allResults.map((addr) => addr.province))]
      return uniqueProvinces.sort()
    } catch (error) {
      console.error('Error getting provinces:', error)
      // Fallback: รายชื่อจังหวัดทั้งหมด 77 จังหวัด
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
        'ภูเก็ต',
        'มหาสารคาม',
        'มุกดาหาร',
        'แม่ฮ่องสอน',
        'ยะลา',
        'ยะโสธร',
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
  }

  // Regional province mapping - ใช้ข้อมูลจริงจาก database
  const regionProvinces: { [key: string]: string[] } = {
    ทุกภาค: [],
    เหนือ: [
      'เชียงใหม่',
      'เชียงราย',
      'กำแพงเพชร',
      'ลำปาง',
      'ลำพูน',
      'แม่ฮ่องสอน',
      'น่าน',
      'นครสวรรค์',
      'พะเยา',
      'แพร่',
      'พิจิตร',
      'พิษณุโลก',
      'เพชรบูรณ์',
      'สุโขทัย',
      'ตาก',
      'อุตรดิตถ์',
      'อุทัยธานี',
    ],
    ใต้: [
      'กระบี่',
      'ชุมพร',
      'ตรัง',
      'นครศรีธรรมราช',
      'นราธิวาส',
      'ปัตตานี',
      'ภูเก็ต',
      'ระนอง',
      'สงขลา',
      'สตูล',
      'สุราษฎร์ธานี',
      'ยะลา',
      'พัทลุง',
      'พังงา',
    ],
    กลาง: [
      'กรุงเทพมหานคร',
      'กาญจนบุรี',
      'นครนายก',
      'นครปฐม',
      'นนทบุรี',
      'ปทุมธานี',
      'พระนครศรีอยุธยา',
      'เพชรบุรี',
      'ราชบุรี',
      'ลพบุรี',
      'สมุทรปราการ',
      'สมุทรสงคราม',
      'สมุทรสาคร',
      'สุพรรณบุรี',
      'ชัยนาท',
      'สระบุรี',
      'สิงห์บุรี',
      'อ่างทอง',
    ],
    ตะวันออกเฉียงเหนือ: [
      'กาฬสินธุ์',
      'ขอนแก่น',
      'ชัยภูมิ',
      'นครราชสีมา',
      'นครพนม',
      'บึงกาฬ',
      'บุรีรัมย์',
      'มหาสารคาม',
      'มุกดาหาร',
      'ยะโสธร',
      'ร้อยเอ็ด',
      'เลย',
      'ศรีสะเกษ',
      'สกลนคร',
      'สุรินทร์',
      'หนองคาย',
      'หนองบัวลำภู',
      'อำนาจเจริญ',
      'อุดรธานี',
      'อุบลราชธานี',
    ],
    ตะวันออก: ['จันทบุรี', 'ฉะเชิงเทรา', 'ชลบุรี', 'ตราด', 'ปราจีนบุรี', 'ระยอง', 'สระแก้ว'],
    ตะวันตก: [
      'ประจวบคีรีขันธ์', // จังหวัดที่เหลือจะถูกคำนวณใน onRegionChange
    ],
  }

  // Dynamic options
  const provinceOptions = ref<{ name: string; value: string }[]>([])
  const districtOptions = ref<{ name: string; value: string }[]>([])
  const subDistrictOptions = ref<{ name: string; value: string }[]>([])
  const zipCodeOptions = ref<{ name: string; value: string }[]>([])

  // Functions to handle cascading selections
  const onRegionChange = async () => {
    if (formArea.value.region === 'ทุกภาค') {
      // แสดงจังหวัดทั้งหมดเมื่อเลือก "ทุกภาค"
      try {
        const allProvinces = getAllProvinces()
        provinceOptions.value = [
          { name: 'ทุกจังหวัด', value: 'ทุกจังหวัด' },
          ...allProvinces.map((prov) => ({ name: prov, value: prov })),
        ]
      } catch (error) {
        console.error('Error loading all provinces:', error)
        provinceOptions.value = [{ name: 'ทุกจังหวัด', value: 'ทุกจังหวัด' }]
      }
    } else if (formArea.value.region === 'ตะวันตก') {
      // สำหรับภาคตะวันตก: หาจังหวัดที่ไม่อยู่ในภาคอื่น ๆ + ประจวบคีรีขันธ์
      try {
        const allProvinces = getAllProvinces()
        const otherRegionProvinces = [
          ...regionProvinces['เหนือ'],
          ...regionProvinces['ใต้'],
          ...regionProvinces['กลาง'],
          ...regionProvinces['ตะวันออกเฉียงเหนือ'],
          ...regionProvinces['ตะวันออก'],
        ]
        const westProvinces = allProvinces.filter(
          (province) => !otherRegionProvinces.includes(province),
        )
        // เพิ่มประจวบคีรีขันธ์ที่อาจจัดอยู่ในภาคตะวันตก
        if (!westProvinces.includes('ประจวบคีรีขันธ์')) {
          westProvinces.push('ประจวบคีรีขันธ์')
        }
        provinceOptions.value = [
          { name: 'ทุกจังหวัด', value: 'ทุกจังหวัด' },
          ...westProvinces.sort().map((prov) => ({ name: prov, value: prov })),
        ]
      } catch (error) {
        console.error('Error loading west provinces:', error)
        // Fallback สำหรับภาคตะวันตก
        const fallbackWestProvinces = ['ประจวบคีรีขันธ์']
        provinceOptions.value = [
          { name: 'ทุกจังหวัด', value: 'ทุกจังหวัด' },
          ...fallbackWestProvinces.map((prov) => ({ name: prov, value: prov })),
        ]
      }
    } else {
      const regionProvs = regionProvinces[formArea.value.region] || []
      provinceOptions.value = [
        { name: 'ทุกจังหวัด', value: 'ทุกจังหวัด' },
        ...regionProvs.map((prov) => ({ name: prov, value: prov })),
      ]
    }
    formArea.value.province = 'ทุกจังหวัด'
    await onProvinceChange()
  }

  const onProvinceChange = async () => {
    if (formArea.value.province === 'ทุกจังหวัด') {
      districtOptions.value = [{ name: 'ทุกอำเภอ', value: 'ทุกอำเภอ' }]
    } else {
      try {
        const results = searchAddressByProvince(formArea.value.province, 1000)
        const uniqueDistricts = [...new Set(results.map((addr) => addr.amphoe))]
        districtOptions.value = [
          { name: 'ทุกอำเภอ', value: 'ทุกอำเภอ' },
          ...uniqueDistricts.map((district) => ({ name: district, value: district })),
        ]
      } catch (error) {
        console.error('Error loading districts:', error)
        districtOptions.value = [{ name: 'ทุกอำเภอ', value: 'ทุกอำเภอ' }]
      }
    }
    formArea.value.district = 'ทุกอำเภอ'
    await onDistrictChange()
  }

  const onDistrictChange = async () => {
    if (formArea.value.district === 'ทุกอำเภอ' || formArea.value.province === 'ทุกจังหวัด') {
      subDistrictOptions.value = [{ name: 'ทุกตำบล', value: 'ทุกตำบล' }]
    } else {
      try {
        const results = searchAddressByAmphoe(formArea.value.district, 1000)
        const filteredResults = results.filter((addr) => addr.province === formArea.value.province)
        const uniqueSubDistricts = [...new Set(filteredResults.map((addr) => addr.tambon))]
        subDistrictOptions.value = [
          { name: 'ทุกตำบล', value: 'ทุกตำบล' },
          ...uniqueSubDistricts.map((subDistrict) => ({ name: subDistrict, value: subDistrict })),
        ]
      } catch (error) {
        console.error('Error loading sub-districts:', error)
        subDistrictOptions.value = [{ name: 'ทุกตำบล', value: 'ทุกตำบล' }]
      }
    }
    formArea.value.sub_district = 'ทุกตำบล'
    await onSubDistrictChange()
  }

  const onSubDistrictChange = async () => {
    if (
      formArea.value.sub_district === 'ทุกตำบล' ||
      formArea.value.district === 'ทุกอำเภอ' ||
      formArea.value.province === 'ทุกจังหวัด'
    ) {
      zipCodeOptions.value = [{ name: 'ทุกรหัสไปรษณีย์', value: 'ทุกรหัสไปรษณีย์' }]
    } else {
      try {
        const results = searchAddressByTambon(formArea.value.sub_district, 1000)
        const filteredResults = results.filter(
          (addr) =>
            addr.province === formArea.value.province && addr.amphoe === formArea.value.district,
        )
        const uniqueZipCodes = [...new Set(filteredResults.map((addr) => addr.zipcode))]
        zipCodeOptions.value = [
          { name: 'ทุกรหัสไปรษณีย์', value: 'ทุกรหัสไปรษณีย์' },
          ...uniqueZipCodes.map((zipCode) => ({ name: zipCode, value: zipCode })),
        ]
      } catch (error) {
        console.error('Error loading zip codes:', error)
        zipCodeOptions.value = [{ name: 'ทุกรหัสไปรษณีย์', value: 'ทุกรหัสไปรษณีย์' }]
      }
    }
    formArea.value.postcode = 'ทุกรหัสไปรษณีย์'
  }

  // Initialize options
  const initializeGeographyOptions = async () => {
    await onRegionChange()
  }

  // Table filter options computed properties
  const getTableFilterOptions = (areas: AreaType[]) => {
    const tableRegionOptions = computed(() => {
      return regions.value
        .filter((region) => region.value !== 'ทุกภาค')
        .map((region) => ({ value: region.value, name: region.name }))
    })

    const tableProvinceOptions = computed(() => {
      try {
        const allProvinces = getAllProvinces()
        return allProvinces.map((province) => ({ value: province, name: province }))
      } catch (error) {
        return []
      }
    })

    const tableDistrictOptions = computed(() => {
      try {
        // ดึงอำเภอจากข้อมูลที่มีอยู่ในตาราง
        const existingDistricts = [...new Set(areas.map((area) => area.district))]
        return existingDistricts
          .filter((district) => district !== 'ทุกอำเภอ')
          .map((district) => ({ value: district, name: district }))
      } catch (error) {
        return []
      }
    })

    const tableSubDistrictOptions = computed(() => {
      try {
        // ดึงตำบลจากข้อมูลที่มีอยู่ในตาราง
        const existingSubDistricts = [...new Set(areas.map((area) => area.sub_district))]
        return existingSubDistricts
          .filter((subDistrict) => subDistrict !== 'ทุกตำบล')
          .map((subDistrict) => ({ value: subDistrict, name: subDistrict }))
      } catch (error) {
        return []
      }
    })

    const tableZipCodeOptions = computed(() => {
      try {
        // ดึงรหัสไปรษณีย์จากข้อมูลที่มีอยู่ในตาราง
        const existingZipCodes = [...new Set(areas.map((area) => area.postcode))]
        return existingZipCodes
          .filter((zipCode) => zipCode !== 'ทุกรหัสไปรษณีย์')
          .map((zipCode) => ({ value: zipCode, name: zipCode }))
      } catch (error) {
        return []
      }
    })

    return {
      tableRegionOptions,
      tableProvinceOptions,
      tableDistrictOptions,
      tableSubDistrictOptions,
      tableZipCodeOptions,
    }
  }

  // Area management functions
  const handleAddArea = () => {
    isEditMode.value = false
    selectedArea.value = null
    formArea.value = {
      condition: 'พื้นที่รับผิดชอบ',
      region: 'ทุกภาค',
      province: 'ทุกจังหวัด',
      district: 'ทุกอำเภอ',
      sub_district: 'ทุกตำบล',
      postcode: 'ทุกรหัสไปรษณีย์',
      is_active: true,
    }
    formAreaError.value = {
      condition: '',
      region: '',
      province: '',
      district: '',
      sub_district: '',
      postcode: '',
      is_active: '',
    }
    initializeGeographyOptions()
    openAreaModal.value = true
  }

  const handleEditArea = async (area: AreaType) => {
    isEditMode.value = true
    selectedArea.value = area
    formArea.value = { ...area }
    formAreaError.value = {
      condition: '',
      region: '',
      province: '',
      district: '',
      sub_district: '',
      postcode: '',
      is_active: '',
    }

    // Initialize cascading options based on current area data
    await onRegionChange()

    // Set correct values after cascade initialization
    if (area.province !== 'ทุกจังหวัด') {
      formArea.value.province = area.province
      await onProvinceChange()

      if (area.district !== 'ทุกอำเภอ') {
        formArea.value.district = area.district
        await onDistrictChange()

        if (area.sub_district !== 'ทุกตำบล') {
          formArea.value.sub_district = area.sub_district
          await onSubDistrictChange()

          if (area.postcode !== 'ทุกรหัสไปรษณีย์') {
            formArea.value.postcode = area.postcode
          }
        }
      }
    }

    openAreaModal.value = true
  }

  const handleDeleteAreaConfirm = (area: AreaType) => {
    selectedArea.value = area
    openDeleteArea.value = true
  }

  const submitAreaForm = async (
    areas: AreaType[],
    onUpdate: (updatedAreas: AreaType[]) => void,
  ) => {
    formAreaError.value.region =
      formArea.value.region && formArea.value.region !== 'ทุกภาค' ? '' : 'กรุณาเลือกภาค'
    formAreaError.value.province =
      formArea.value.province && formArea.value.province !== 'ทุกจังหวัด' ? '' : 'กรุณาเลือกจังหวัด'

    if (!formArea.value.region || !formArea.value.province) {
      push.warning('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    let updatedAreas = [...areas]

    try {
      if (isEditMode.value && selectedArea.value) {
        const payload = {
          id: selectedArea.value.number,
          data: { ...formArea.value },
        }

        const res = await API('specific\\maxtech\\setting_admin_area', 'update', payload)

        if (res.response_status) {
          const index = updatedAreas.findIndex((area) => area.number === selectedArea.value!.number)
          if (index !== -1) {
            updatedAreas[index] = {
              ...formArea.value,
              number: selectedArea.value.number,
            } as AreaType
          }
          push.success('แก้ไขพื้นที่สำเร็จ!')
          onUpdate(updatedAreas)
          openAreaModal.value = false
        } else {
          push.error('ไม่สามารถแก้ไขพื้นที่ได้\n' + res.response_message)
        }
      } else {
        const payload = {
          admin_id: route.params.id,
          data: { ...formArea.value },
        }

        const res = await API('specific\\maxtech\\setting_admin_area', 'insert', payload)

        if (res.response_status) {
          const newArea: AreaType = {
            ...formArea.value,
            number: updatedAreas.length + 1,
          } as AreaType
          updatedAreas.push(newArea)

          push.success('เพิ่มพื้นที่สำเร็จ!')
          onUpdate(updatedAreas)
          openAreaModal.value = false
        } else {
          push.error('ไม่สามารถเพิ่มพื้นที่ได้\n' + res.response_message)
        }
      }
    } catch (error: any) {
      console.error('Error in submitAreaForm:', error)
      push.error('เกิดข้อผิดพลาดในการเชื่อมต่อ API')
    }
  }

  const submitDeleteArea = (areas: AreaType[], onUpdate: (updatedAreas: AreaType[]) => void) => {
    if (!selectedArea.value) return

    // Remove area
    let updatedAreas = [...areas]
    const index = updatedAreas.findIndex((area) => area.number === selectedArea.value!.number)
    if (index !== -1) {
      updatedAreas.splice(index, 1)
      // Renumber remaining areas
      updatedAreas.forEach((area, idx) => {
        area.number = idx + 1
      })
    }
    openDeleteArea.value = false
    push.success('ลบพื้นที่สำเร็จ!')

    onUpdate(updatedAreas)
  }

  return {
    // State
    openAreaModal,
    openDeleteArea,
    selectedArea,
    isEditMode,
    formArea,
    formAreaError,
    regions,
    provinceOptions,
    districtOptions,
    subDistrictOptions,
    zipCodeOptions,

    // Functions
    getAllProvinces,
    onRegionChange,
    onProvinceChange,
    onDistrictChange,
    onSubDistrictChange,
    initializeGeographyOptions,
    getTableFilterOptions,
    handleAddArea,
    handleEditArea,
    handleDeleteAreaConfirm,
    submitAreaForm,
    submitDeleteArea,
  }
}

# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_05_30_041415) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.bigint "record_id", null: false
    t.string "record_type", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.string "content_type"
    t.datetime "created_at", null: false
    t.string "filename", null: false
    t.string "key", null: false
    t.text "metadata"
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "listings", force: :cascade do |t|
    t.string "address_text"
    t.jsonb "ambiente"
    t.jsonb "availability", default: {}
    t.jsonb "caracteristicas"
    t.string "comuna"
    t.datetime "created_at", null: false
    t.text "description"
    t.integer "edad_max"
    t.integer "edad_min"
    t.boolean "gastos_incluidos", default: false
    t.string "genero_requerido"
    t.float "lat"
    t.float "lng"
    t.integer "nivel_limpieza_minimo"
    t.boolean "no_fumadores"
    t.boolean "no_mascotas"
    t.jsonb "ocupacion_preferida"
    t.jsonb "photos", default: []
    t.integer "price"
    t.integer "roommates_actuales"
    t.jsonb "rules", default: {}
    t.jsonb "services", default: {}
    t.string "title"
    t.integer "total_roommates"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.integer "views_count", default: 0, null: false
    t.index ["user_id"], name: "index_listings_on_user_id"
  end

  create_table "matches", force: :cascade do |t|
    t.integer "compatibility_score", default: 0
    t.datetime "created_at", null: false
    t.integer "matched_id", null: false
    t.string "matched_type", null: false
    t.string "status", default: "active"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["matched_id", "matched_type"], name: "index_matches_on_matched_id_and_matched_type"
    t.index ["user_id", "matched_id", "matched_type"], name: "index_matches_unique", unique: true
    t.index ["user_id", "status"], name: "index_matches_on_user_id_and_status"
    t.index ["user_id"], name: "index_matches_on_user_id"
  end

  create_table "messages", force: :cascade do |t|
    t.text "content", null: false
    t.datetime "created_at", null: false
    t.bigint "match_id", null: false
    t.datetime "read_at"
    t.bigint "sender_id", null: false
    t.datetime "updated_at", null: false
    t.index ["match_id", "created_at"], name: "index_messages_on_match_id_and_created_at"
    t.index ["match_id", "read_at"], name: "index_messages_on_match_id_and_read_at"
    t.index ["match_id"], name: "index_messages_on_match_id"
    t.index ["sender_id"], name: "index_messages_on_sender_id"
  end

  create_table "profiles", force: :cascade do |t|
    t.integer "age"
    t.text "bio"
    t.integer "budget_max"
    t.integer "budget_min"
    t.string "comuna"
    t.datetime "created_at", null: false
    t.jsonb "habits", default: {}
    t.string "institution"
    t.string "name"
    t.string "occupation"
    t.boolean "pets", default: false
    t.string "photo_url"
    t.float "reputation_score", default: 0.0
    t.boolean "smoker", default: false
    t.jsonb "social_links", default: {}
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["user_id"], name: "index_profiles_on_user_id"
  end

  create_table "swipes", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "direction", null: false
    t.integer "target_id", null: false
    t.string "target_type", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["target_id", "target_type"], name: "index_swipes_on_target_id_and_target_type"
    t.index ["user_id", "target_id", "target_type"], name: "index_swipes_unique", unique: true
    t.index ["user_id"], name: "index_swipes_on_user_id"
  end

  create_table "user_preferences", force: :cascade do |t|
    t.jsonb "comunas_preferidas"
    t.boolean "con_mascotas_ok"
    t.datetime "created_at", null: false
    t.integer "edad_max"
    t.integer "edad_min"
    t.boolean "fumador_ok"
    t.string "genero_preferido"
    t.string "horarios_compatibles"
    t.integer "nivel_limpieza_min"
    t.integer "precio_max"
    t.integer "precio_min"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["user_id"], name: "index_user_preferences_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.text "bio"
    t.datetime "created_at", null: false
    t.integer "edad"
    t.string "email", null: false
    t.boolean "es_fumador"
    t.string "foto_perfil"
    t.string "genero"
    t.jsonb "hobbies"
    t.string "horarios"
    t.string "ingresos_rango"
    t.integer "nivel_limpieza"
    t.integer "nivel_ruido"
    t.string "nombre"
    t.string "ocupacion"
    t.boolean "onboarding_completed"
    t.string "password_digest"
    t.jsonb "personalidad"
    t.string "phone"
    t.string "profesion"
    t.string "role", default: "user"
    t.boolean "tiene_mascota"
    t.string "tipo_usuario"
    t.datetime "updated_at", null: false
    t.boolean "verified_email", default: false
    t.boolean "verified_id", default: false
    t.boolean "visitas_frecuentes"
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "listings", "users"
  add_foreign_key "matches", "users"
  add_foreign_key "messages", "matches"
  add_foreign_key "messages", "users", column: "sender_id"
  add_foreign_key "profiles", "users"
  add_foreign_key "swipes", "users"
  add_foreign_key "user_preferences", "users"
end

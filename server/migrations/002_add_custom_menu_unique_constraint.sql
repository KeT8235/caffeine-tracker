USE caffeine_app;

ALTER TABLE custom_menu
ADD CONSTRAINT uniq_member_menu UNIQUE KEY (member_id, menu_name);

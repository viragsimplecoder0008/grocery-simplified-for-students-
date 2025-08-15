-- Create groups system for collaborative grocery lists
-- Migration: Add Groups System

-- Create groups table
CREATE TABLE public.groups (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  join_code TEXT UNIQUE NOT NULL,
  leader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create group memberships table
CREATE TABLE public.group_memberships (
  id BIGSERIAL PRIMARY KEY,
  group_id BIGINT NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(group_id, user_id)
);

-- Create shared grocery lists for groups
CREATE TABLE public.group_grocery_lists (
  id BIGSERIAL PRIMARY KEY,
  group_id BIGINT NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES public.products(id) ON DELETE SET NULL,
  name TEXT NOT NULL, -- Store product name in case product is deleted
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10,2) DEFAULT 0,
  category TEXT,
  added_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_purchased BOOLEAN DEFAULT FALSE,
  purchased_by UUID REFERENCES public.profiles(id),
  purchased_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create notifications table for group activities
CREATE TABLE public.group_notifications (
  id BIGSERIAL PRIMARY KEY,
  group_id BIGINT NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('item_added', 'item_purchased', 'item_removed', 'member_joined', 'member_left')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Store additional data like item details
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_grocery_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_notifications ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_groups_join_code ON public.groups(join_code);
CREATE INDEX idx_groups_leader_id ON public.groups(leader_id);
CREATE INDEX idx_group_memberships_user_id ON public.group_memberships(user_id);
CREATE INDEX idx_group_memberships_group_id ON public.group_memberships(group_id);
CREATE INDEX idx_group_grocery_lists_group_id ON public.group_grocery_lists(group_id);
CREATE INDEX idx_group_notifications_user_id ON public.group_notifications(user_id);
CREATE INDEX idx_group_notifications_group_id ON public.group_notifications(group_id);

-- Function to generate unique join codes
CREATE OR REPLACE FUNCTION generate_join_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 6-character alphanumeric code
    code := upper(substring(md5(random()::text) from 1 for 6));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.groups WHERE join_code = code) INTO exists;
    
    IF NOT exists THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$;

-- Function to check if user can join more groups (max 3)
CREATE OR REPLACE FUNCTION can_join_group(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT (
    SELECT COUNT(*) 
    FROM public.group_memberships 
    WHERE user_id = user_uuid AND is_active = true
  ) < 3;
$$;

-- Function to get user's active group count
CREATE OR REPLACE FUNCTION get_user_group_count(user_uuid UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
AS $$
  SELECT COUNT(*)::INTEGER 
  FROM public.group_memberships 
  WHERE user_id = user_uuid AND is_active = true;
$$;

-- RLS Policies for groups
CREATE POLICY "Users can view groups they are members of" ON public.groups
  FOR SELECT USING (
    auth.uid() = leader_id OR
    EXISTS(
      SELECT 1 FROM public.group_memberships 
      WHERE group_id = groups.id AND user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can create groups" ON public.groups
  FOR INSERT WITH CHECK (auth.uid() = leader_id);

CREATE POLICY "Group leaders can update their groups" ON public.groups
  FOR UPDATE USING (auth.uid() = leader_id);

CREATE POLICY "Group leaders can delete their groups" ON public.groups
  FOR DELETE USING (auth.uid() = leader_id);

-- RLS Policies for group memberships
CREATE POLICY "Users can view memberships of their groups" ON public.group_memberships
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS(
      SELECT 1 FROM public.groups g 
      WHERE g.id = group_id AND (
        g.leader_id = auth.uid() OR
        EXISTS(
          SELECT 1 FROM public.group_memberships gm2 
          WHERE gm2.group_id = g.id AND gm2.user_id = auth.uid() AND gm2.is_active = true
        )
      )
    )
  );

CREATE POLICY "Users can join groups if they have space" ON public.group_memberships
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    can_join_group(auth.uid())
  );

CREATE POLICY "Users can leave groups or leaders can remove members" ON public.group_memberships
  FOR UPDATE USING (
    auth.uid() = user_id OR
    EXISTS(SELECT 1 FROM public.groups WHERE id = group_id AND leader_id = auth.uid())
  );

-- RLS Policies for group grocery lists
CREATE POLICY "Group members can view group grocery lists" ON public.group_grocery_lists
  FOR SELECT USING (
    EXISTS(
      SELECT 1 FROM public.group_memberships gm
      JOIN public.groups g ON g.id = gm.group_id
      WHERE gm.group_id = group_grocery_lists.group_id 
        AND gm.user_id = auth.uid() 
        AND gm.is_active = true
        AND g.is_active = true
    )
  );

CREATE POLICY "Group members can add items to group grocery lists" ON public.group_grocery_lists
  FOR INSERT WITH CHECK (
    auth.uid() = added_by AND
    EXISTS(
      SELECT 1 FROM public.group_memberships gm
      JOIN public.groups g ON g.id = gm.group_id
      WHERE gm.group_id = group_grocery_lists.group_id 
        AND gm.user_id = auth.uid() 
        AND gm.is_active = true
        AND g.is_active = true
    )
  );

CREATE POLICY "Group members can update group grocery lists" ON public.group_grocery_lists
  FOR UPDATE USING (
    EXISTS(
      SELECT 1 FROM public.group_memberships gm
      JOIN public.groups g ON g.id = gm.group_id
      WHERE gm.group_id = group_grocery_lists.group_id 
        AND gm.user_id = auth.uid() 
        AND gm.is_active = true
        AND g.is_active = true
    )
  );

CREATE POLICY "Group leaders and item creators can delete items" ON public.group_grocery_lists
  FOR DELETE USING (
    auth.uid() = added_by OR
    EXISTS(SELECT 1 FROM public.groups WHERE id = group_id AND leader_id = auth.uid())
  );

-- RLS Policies for group notifications
CREATE POLICY "Users can view their own notifications" ON public.group_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.group_notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON public.group_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Create updated_at triggers
CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_group_grocery_lists_updated_at
  BEFORE UPDATE ON public.group_grocery_lists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create notifications when items are added/updated
CREATE OR REPLACE FUNCTION notify_group_members()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  group_name TEXT;
  member_record RECORD;
  notification_title TEXT;
  notification_message TEXT;
  user_name TEXT;
BEGIN
  -- Get group name and user name
  SELECT g.name, p.full_name 
  INTO group_name, user_name
  FROM public.groups g, public.profiles p
  WHERE g.id = COALESCE(NEW.group_id, OLD.group_id) 
    AND p.id = COALESCE(NEW.added_by, NEW.purchased_by, OLD.added_by);

  -- Determine notification type and content
  IF TG_OP = 'INSERT' THEN
    notification_title := 'New item added to ' || group_name;
    notification_message := user_name || ' added "' || NEW.name || '" to the grocery list';
    
    -- Notify all group members except the one who added the item
    FOR member_record IN 
      SELECT user_id 
      FROM public.group_memberships 
      WHERE group_id = NEW.group_id 
        AND is_active = true 
        AND user_id != NEW.added_by
    LOOP
      INSERT INTO public.group_notifications (group_id, user_id, type, title, message, data)
      VALUES (
        NEW.group_id, 
        member_record.user_id, 
        'item_added', 
        notification_title, 
        notification_message,
        jsonb_build_object(
          'item_id', NEW.id,
          'item_name', NEW.name,
          'added_by', user_name,
          'quantity', NEW.quantity
        )
      );
    END LOOP;
    
  ELSIF TG_OP = 'UPDATE' AND OLD.is_purchased = false AND NEW.is_purchased = true THEN
    notification_title := 'Item purchased in ' || group_name;
    notification_message := user_name || ' marked "' || NEW.name || '" as purchased';
    
    -- Notify all group members except the one who purchased the item
    FOR member_record IN 
      SELECT user_id 
      FROM public.group_memberships 
      WHERE group_id = NEW.group_id 
        AND is_active = true 
        AND user_id != NEW.purchased_by
    LOOP
      INSERT INTO public.group_notifications (group_id, user_id, type, title, message, data)
      VALUES (
        NEW.group_id, 
        member_record.user_id, 
        'item_purchased', 
        notification_title, 
        notification_message,
        jsonb_build_object(
          'item_id', NEW.id,
          'item_name', NEW.name,
          'purchased_by', user_name
        )
      );
    END LOOP;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for group grocery list notifications
CREATE TRIGGER trigger_notify_group_members
  AFTER INSERT OR UPDATE ON public.group_grocery_lists
  FOR EACH ROW EXECUTE FUNCTION notify_group_members();

-- Function to notify when members join/leave groups
CREATE OR REPLACE FUNCTION notify_group_membership_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  group_name TEXT;
  user_name TEXT;
  member_record RECORD;
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  -- Get group and user names
  SELECT g.name, p.full_name 
  INTO group_name, user_name
  FROM public.groups g, public.profiles p
  WHERE g.id = COALESCE(NEW.group_id, OLD.group_id) 
    AND p.id = COALESCE(NEW.user_id, OLD.user_id);

  IF TG_OP = 'INSERT' AND NEW.is_active = true THEN
    notification_title := 'New member joined ' || group_name;
    notification_message := user_name || ' joined the group';
    
    -- Notify all other group members
    FOR member_record IN 
      SELECT user_id 
      FROM public.group_memberships 
      WHERE group_id = NEW.group_id 
        AND is_active = true 
        AND user_id != NEW.user_id
    LOOP
      INSERT INTO public.group_notifications (group_id, user_id, type, title, message, data)
      VALUES (
        NEW.group_id, 
        member_record.user_id, 
        'member_joined', 
        notification_title, 
        notification_message,
        jsonb_build_object('new_member', user_name)
      );
    END LOOP;
    
  ELSIF TG_OP = 'UPDATE' AND OLD.is_active = true AND NEW.is_active = false THEN
    notification_title := 'Member left ' || group_name;
    notification_message := user_name || ' left the group';
    
    -- Notify all remaining group members
    FOR member_record IN 
      SELECT user_id 
      FROM public.group_memberships 
      WHERE group_id = NEW.group_id 
        AND is_active = true 
        AND user_id != NEW.user_id
    LOOP
      INSERT INTO public.group_notifications (group_id, user_id, type, title, message, data)
      VALUES (
        NEW.group_id, 
        member_record.user_id, 
        'member_left', 
        notification_title, 
        notification_message,
        jsonb_build_object('left_member', user_name)
      );
    END LOOP;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for group membership notifications
CREATE TRIGGER trigger_notify_group_membership_changes
  AFTER INSERT OR UPDATE ON public.group_memberships
  FOR EACH ROW EXECUTE FUNCTION notify_group_membership_changes();

-- Insert some sample groups for testing (optional)
-- INSERT INTO public.groups (name, description, join_code, leader_id) VALUES
-- ('CS Department', 'Computer Science students grocery group', 'CS2024', 'leader-uuid-here'),
-- ('Hostel Block A', 'Block A residents shared shopping list', 'BLKA01', 'leader-uuid-here');
